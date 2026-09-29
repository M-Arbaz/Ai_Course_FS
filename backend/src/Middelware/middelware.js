import "dotenv/config";

import multer from "multer";
import path from "node:path";
import {
    fileURLToPath,
} from "node:url";
import {
    mkdirSync,
} from "node:fs";
import {
    createHash,
    randomBytes,
} from "node:crypto";

import db from "../DB/db.js";


// ==========================================
// PATHS
// ==========================================

const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);

const USER_PROFILE_DIR =
    path.resolve(
        __dirname,
        "../../public_assets/user_profile"
    );

// Folder missing ho to automatically create
mkdirSync(
    USER_PROFILE_DIR,
    {
        recursive: true,
    }
);


// ==========================================
// AUTH HELPERS
// ==========================================

const SESSION_COOKIE_NAME =
    process.env.SESSION_COOKIE_NAME ||
    "ai_course_session";


const getCookieValue = (
    req,
    cookieName
) => {
    const cookieHeader =
        req.headers.cookie;

    if (!cookieHeader) {
        return null;
    }

    const cookies =
        cookieHeader.split(";");

    for (const cookie of cookies) {
        const [name, ...valueParts] =
            cookie.trim().split("=");

        if (name === cookieName) {
            return decodeURIComponent(
                valueParts.join("=")
            );
        }
    }

    return null;
};


const hashSessionToken = (token) =>
    createHash("sha256")
        .update(token)
        .digest("hex");


// ==========================================
// REQUIRE AUTH
// ==========================================

export const requireAuth =
    async (req, res, next) => {
        try {
            const sessionToken =
                getCookieValue(
                    req,
                    SESSION_COOKIE_NAME
                );

            if (!sessionToken) {
                return res
                    .status(401)
                    .json({
                        success: false,
                        message:
                            "Authentication required.",
                    });
            }

            const tokenHash =
                hashSessionToken(
                    sessionToken
                );

            const [sessions] =
                await db.execute(
                    `
                    SELECT
                        s.id AS session_id,
                        s.user_id
                    FROM auth_sessions s
                    INNER JOIN users u
                        ON u.id = s.user_id
                    WHERE
                        s.token_hash = ?
                        AND s.revoked_at IS NULL
                        AND s.expires_at > NOW()
                        AND u.status = 'active'
                    LIMIT 1
                    `,
                    [tokenHash]
                );

            if (
                sessions.length === 0
            ) {
                res.clearCookie(
                    SESSION_COOKIE_NAME,
                    {
                        httpOnly: true,
                        secure:
                            process.env
                                .COOKIE_SECURE ===
                            "true",
                        sameSite: "lax",
                        path: "/",
                    }
                );

                return res
                    .status(401)
                    .json({
                        success: false,
                        message:
                            "Session expired. Please sign in again.",
                    });
            }

            req.auth = {
                userId:
                    sessions[0].user_id,

                sessionId:
                    sessions[0].session_id,
            };

            next();
        } catch (error) {
            console.error(
                "Auth middleware error:",
                error
            );

            return res
                .status(500)
                .json({
                    success: false,
                    message:
                        "Unable to verify authentication.",
                });
        }
    };


// ==========================================
// PROFILE IMAGE UPLOAD
// ==========================================

const allowedImageTypes = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
};


const storage =
    multer.diskStorage({
        destination: (
            req,
            file,
            callback
        ) => {
            callback(
                null,
                USER_PROFILE_DIR
            );
        },

        filename: (
            req,
            file,
            callback
        ) => {
            const extension =
                allowedImageTypes[
                file.mimetype
                ];

            const randomPart =
                randomBytes(12)
                    .toString("hex");

            const fileName =
                `user_${req.auth.userId}_${Date.now()}_${randomPart}${extension}`;

            callback(
                null,
                fileName
            );
        },
    });


const upload =
    multer({
        storage,

        limits: {
            fileSize:
                3 * 1024 * 1024,
        },

        fileFilter: (
            req,
            file,
            callback
        ) => {
            if (
                !allowedImageTypes[
                file.mimetype
                ]
            ) {
                return callback(
                    new Error(
                        "Only JPG, PNG and WEBP images are allowed."
                    )
                );
            }

            callback(
                null,
                true
            );
        },
    });


const singleProfileUpload =
    upload.single(
        "profileImage"
    );


// ==========================================
// PROFILE IMAGE MIDDLEWARE
// ==========================================

export const profileImageUpload =
    (req, res, next) => {

        singleProfileUpload(
            req,
            res,
            (error) => {

                if (!error) {
                    return next();
                }

                if (
                    error instanceof
                    multer.MulterError
                ) {
                    if (
                        error.code ===
                        "LIMIT_FILE_SIZE"
                    ) {
                        return res
                            .status(413)
                            .json({
                                success:
                                    false,

                                message:
                                    "Profile image must be 3MB or smaller.",
                            });
                    }

                    return res
                        .status(400)
                        .json({
                            success: false,

                            message:
                                "Unable to upload profile image.",
                        });
                }

                return res
                    .status(400)
                    .json({
                        success: false,

                        message:
                            error.message ||
                            "Invalid profile image.",
                    });
            }
        );
    };