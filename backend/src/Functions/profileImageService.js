import path from "node:path";
import {
    fileURLToPath,
} from "node:url";

import {
    access,
    mkdir,
    open,
    readdir,
    rename,
    unlink,
} from "node:fs/promises";

import sharp from "sharp";

import db from "../DB/db.js";


const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);


const PROFILE_DIRECTORY =
    path.resolve(
        __dirname,
        "../../public_assets/user_profile"
    );

const PUBLIC_PREFIX =
    "/public_assets/user_profile";

const SCAN_INTERVAL =
    10 * 1000;

const supportedExtensions =
    new Set([
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
    ]);

let scanRunning = false;
let scanTimer = null;


// ==========================================
// CHECK FILE
// ==========================================

const shouldProcessFile =
    (fileName) => {

        const extension =
            path.extname(fileName)
                .toLowerCase();

        if (
            !supportedExtensions.has(
                extension
            )
        ) {
            return false;
        }

        // Already optimized image
        if (
            fileName.endsWith(
                ".optimized.webp"
            )
        ) {
            return false;
        }

        return true;
    };


// ==========================================
// CHECK DB REFERENCE
// ==========================================

const isImageUsedByUser =
    async (relativePath) => {

        const [rows] =
            await db.execute(
                `
                SELECT id
                FROM users
                WHERE profile_image = ?
                LIMIT 1
                `,
                [relativePath]
            );

        return rows.length > 0;
    };


// ==========================================
// COMPRESS ONE IMAGE
// ==========================================

export const compressProfileImage =
    async (relativePath) => {

        if (
            !relativePath ||
            !relativePath.startsWith(
                `${PUBLIC_PREFIX}/`
            )
        ) {
            return null;
        }

        const fileName =
            path.basename(
                relativePath
            );

        if (
            !shouldProcessFile(
                fileName
            )
        ) {
            return relativePath;
        }


        const sourcePath =
            path.join(
                PROFILE_DIRECTORY,
                fileName
            );

        const lockPath =
            `${sourcePath}.compress.lock`;

        let lockHandle = null;

        try {

            // Prevent 2 Node processes
            // compressing same image
            try {
                lockHandle =
                    await open(
                        lockPath,
                        "wx"
                    );
            } catch (error) {

                if (
                    error.code ===
                    "EEXIST"
                ) {
                    return null;
                }

                throw error;
            }


            await access(
                sourcePath
            );


            // Only process images
            // actually attached to a user
            const imageInUse =
                await isImageUsedByUser(
                    relativePath
                );

            if (!imageInUse) {
                return null;
            }


            const parsed =
                path.parse(fileName);

            const newFileName =
                `${parsed.name}.optimized.webp`;

            const destinationPath =
                path.join(
                    PROFILE_DIRECTORY,
                    newFileName
                );

            const tempPath =
                `${destinationPath}.tmp`;

            const newRelativePath =
                `${PUBLIC_PREFIX}/${newFileName}`;


            // ==================================
            // SHARP
            // ==================================

            await sharp(
                sourcePath
            )
                .rotate()
                .resize({
                    width: 512,
                    height: 512,
                    fit: "inside",
                    withoutEnlargement:
                        true,
                })
                .webp({
                    quality: 80,
                    effort: 4,
                })
                .toFile(
                    tempPath
                );


            // Atomic final save
            await rename(
                tempPath,
                destinationPath
            );


            // ==================================
            // UPDATE DATABASE
            // ==================================

            const [result] =
                await db.execute(
                    `
                    UPDATE users
                    SET
                        profile_image = ?,
                        updated_at =
                            CURRENT_TIMESTAMP
                            
                    WHERE
                        profile_image = ?
                    `,
                    [
                        newRelativePath,
                        relativePath,
                    ]
                );


            // User changed image while
            // compression was happening
            if (
                result.affectedRows === 0
            ) {

                try {
                    await unlink(
                        destinationPath
                    );
                } catch {
                    // ignore
                }

                return null;
            }


            // ==================================
            // DELETE ORIGINAL
            // ==================================

            try {
                await unlink(
                    sourcePath
                );
            } catch (error) {

                if (
                    error.code !==
                    "ENOENT"
                ) {
                    console.error(
                        "Original profile image delete error:",
                        error
                    );
                }
            }


            console.log(
                `Profile image optimized: ${fileName} -> ${newFileName}`
            );

            return newRelativePath;

        } catch (error) {

            console.error(
                "Profile image compression error:",
                error
            );

            return null;

        } finally {

            if (lockHandle) {
                try {
                    await lockHandle
                        .close();
                } catch {
                    // ignore
                }
            }

            try {
                await unlink(
                    lockPath
                );
            } catch {
                // ignore
            }
        }
    };


// ==========================================
// SCAN PROFILE FOLDER
// ==========================================

export const scanProfileImages =
    async () => {

        if (scanRunning) {
            return;
        }

        scanRunning = true;

        try {

            await mkdir(
                PROFILE_DIRECTORY,
                {
                    recursive: true,
                }
            );


            const files =
                await readdir(
                    PROFILE_DIRECTORY
                );


            for (
                const fileName
                of files
            ) {

                if (
                    !shouldProcessFile(
                        fileName
                    )
                ) {
                    continue;
                }


                const relativePath =
                    `${PUBLIC_PREFIX}/${fileName}`;


                const imageInUse =
                    await isImageUsedByUser(
                        relativePath
                    );


                if (!imageInUse) {
                    continue;
                }


                await compressProfileImage(
                    relativePath
                );
            }

        } catch (error) {

            console.error(
                "Profile image scan error:",
                error
            );

        } finally {

            scanRunning = false;
        }
    };


// ==========================================
// START BACKGROUND SERVICE
// ==========================================

export const startProfileImageService =
    () => {

        if (scanTimer) {
            return;
        }


        console.log(
            "Profile image optimization service started."
        );


        // Scan immediately on server start
        scanProfileImages()
            .catch((error) => {

                console.error(
                    "Initial profile image scan error:",
                    error
                );
            });


        // Keep checking for new images
        scanTimer =
            setInterval(
                () => {

                    scanProfileImages()
                        .catch(
                            (error) => {

                                console.error(
                                    "Profile image service error:",
                                    error
                                );
                            }
                        );

                },
                SCAN_INTERVAL
            );


        // Timer should not prevent
        // Node process shutdown
        scanTimer.unref?.();
    };