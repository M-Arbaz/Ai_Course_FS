"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/lib/api";

export default function AccountPage() {
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [loading, setLoading] =
        useState(true);

    const [loggingOut, setLoggingOut] =
        useState(false);
    const [isEditing, setIsEditing] =
        useState(false);

    const [savingProfile, setSavingProfile] =
        useState(false);

    const [editFirstName, setEditFirstName] =
        useState("");

    const [editLastName, setEditLastName] =
        useState("");

    const [currentPassword, setCurrentPassword] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmNewPassword, setConfirmNewPassword] =
        useState("");

    const [editMessage, setEditMessage] =
        useState("");

    const profileInputRef = useRef(null);

    const [
        uploadingProfileImage,
        setUploadingProfileImage,
    ] = useState(false);

    const [
        profileMessage,
        setProfileMessage,
    ] = useState("");

    const [error, setError] =
        useState("");

    useEffect(() => {
        let active = true;

        const loadAccount = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${api()}/api/auth/me`,
                    {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                    }
                );

                if (!active) return;

                if (
                    response.status === 401
                ) {
                    router.replace("/login");
                    return;
                }

                const data =
                    await response.json();

                if (!response.ok) {
                    setError(
                        data?.message ||
                        "Unable to load your account."
                    );

                    return;
                }

                if (
                    !data?.authenticated ||
                    !data?.user
                ) {
                    router.replace("/login");
                    return;
                }

                setUser(data.user);
            } catch (error) {
                console.error(
                    "Account load error:",
                    error
                );

                if (active) {
                    setError(
                        "Unable to connect to the server."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadAccount();

        return () => {
            active = false;
        };
    }, [router]);

    const handleProfileImageChange =
        async (event) => {
            const file =
                event.target.files?.[0];

            // Same image dobara select karne ke liye
            event.target.value = "";

            if (!file) {
                return;
            }

            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp",
            ];

            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {
                setError(
                    "Only JPG, PNG and WEBP images are allowed."
                );

                return;
            }

            if (
                file.size >
                10 * 1024 * 1024
            ) {
                setError(
                    "Profile image must be 10MB or smaller."
                );

                return;
            }

            try {
                setUploadingProfileImage(
                    true
                );

                setError("");
                setProfileMessage("");

                const formData =
                    new FormData();

                formData.append(
                    "profileImage",
                    file
                );

                const response =
                    await fetch(
                        `${api()}/api/auth/profile-image`,
                        {
                            method: "POST",
                            credentials:
                                "include",

                            body: formData,
                        }
                    );

                const data =
                    await response
                        .json()
                        .catch(
                            () => ({})
                        );

                if (
                    response.status === 401
                ) {
                    router.replace(
                        "/login"
                    );

                    return;
                }

                if (!response.ok) {
                    setError(
                        data?.message ||
                        "Unable to update profile picture."
                    );

                    return;
                }

                setUser(
                    (currentUser) => ({
                        ...currentUser,

                        profileImage:
                            data.profileImage,
                    })
                );

                setProfileMessage(
                    "Profile picture updated successfully."
                );
                router.refresh();
            } catch (error) {
                console.error(
                    "Profile image upload error:",
                    error
                );

                setError(
                    "Unable to upload profile picture."
                );
            } finally {
                setUploadingProfileImage(
                    false
                );
            }
        };


    const openEditProfile = () => {
        setEditFirstName(
            user?.firstName || ""
        );

        setEditLastName(
            user?.lastName || ""
        );

        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");

        setError("");
        setEditMessage("");

        setIsEditing(true);
    };


    const cancelEditProfile = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");

        setError("");
        setEditMessage("");

        setIsEditing(false);
    };

    const handleSaveProfile =
        async (event) => {
            event.preventDefault();

            try {
                setSavingProfile(true);
                setError("");
                setEditMessage("");

                const response =
                    await fetch(
                        `${api()}/api/auth/profile`,
                        {
                            method: "PATCH",

                            credentials:
                                "include",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            body:
                                JSON.stringify({
                                    firstName:
                                        editFirstName,

                                    lastName:
                                        editLastName,

                                    currentPassword,

                                    newPassword,

                                    confirmPassword:
                                        confirmNewPassword,
                                }),
                        }
                    );

                const data =
                    await response
                        .json()
                        .catch(() => ({}));

                if (
                    response.status === 401
                ) {
                    router.replace(
                        "/login"
                    );

                    return;
                }

                if (!response.ok) {
                    setError(
                        data?.message ||
                        "Unable to update profile."
                    );

                    return;
                }

                setUser(
                    (currentUser) => ({
                        ...currentUser,

                        firstName:
                            data.user
                                ?.firstName ||
                            editFirstName,

                        lastName:
                            data.user
                                ?.lastName ||
                            editLastName,
                    })
                );

                setCurrentPassword("");
                setNewPassword("");
                setConfirmNewPassword("");

                setEditMessage(
                    data?.message ||
                    "Profile updated successfully."
                );

                setIsEditing(false);

            } catch (error) {
                console.error(
                    "Profile update error:",
                    error
                );

                setError(
                    "Unable to update profile."
                );
            } finally {
                setSavingProfile(false);
            }
        };

    const handleLogout = async () => {
        try {
            setLoggingOut(true);
            setError("");

            const response = await fetch(
                `${api()}/api/auth/logout`,
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            let data = {};

            try {
                data = await response.json();
            } catch {
                data = {};
            }

            if (!response.ok) {
                setError(
                    data?.message ||
                    "Unable to logout."
                );

                return;
            }

            router.push("/login");
            router.refresh();
        } catch (error) {
            console.error(
                "Logout error:",
                error
            );

            setError(
                "Unable to logout. Please try again."
            );
        } finally {
            setLoggingOut(false);
        }
    };

    const initial =
        user?.firstName
            ?.charAt(0)
            .toUpperCase() || "U";

    const profileImageUrl =
        user?.profileImage
            ? user.profileImage.startsWith("http")
                ? user.profileImage
                : `${api()}${user.profileImage}`
            : null;

    return (
        <>
            <Navbar />

            <main className="min-h-[70vh] overflow-hidden bg-white">
                <section className="relative overflow-hidden border-b border-purple-100">
                    <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-purple-200/60 blur-3xl" />

                    <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-lime-200/60 blur-3xl" />

                    <div className="absolute bottom-0 left-1/2 h-64 w-64 rounded-full bg-pink-100 blur-3xl" />

                    <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8">
                        <div className="inline-flex rounded-full border border-purple-100 bg-white px-4 py-2 text-sm font-bold text-purple-600 shadow-sm">
                            My Account
                        </div>

                        <h1 className="mt-5 text-4xl font-black tracking-tight text-[#21172f] md:text-5xl">
                            Welcome back
                            {user?.firstName
                                ? `, ${user.firstName}`
                                : ""}
                            .
                        </h1>

                        <p className="mt-4 max-w-2xl leading-7 text-slate-500">
                            Manage your AI Academy
                            account and profile
                            information.
                        </p>
                    </div>
                </section>

                <section className="py-16">
                    <div className="mx-auto max-w-5xl px-6 lg:px-8">
                        {loading && (
                            <div className="rounded-[30px] border border-purple-100 bg-[#fbfaff] p-10 text-center shadow-sm">
                                <p className="font-bold text-purple-600">
                                    Loading your
                                    account...
                                </p>
                            </div>
                        )}

                        {!loading && error && (
                            <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
                                {error}
                            </div>
                        )}

                        {!loading && user && (
                            <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
                                <div className="rounded-[30px] bg-gradient-to-br from-[#ede9fe] via-[#fce7f3] to-[#dbeafe] p-8">
                                    <div className="relative w-fit">

                                        <div
                                            className="
            flex
            h-24
            w-24
            items-center
            justify-center
            overflow-hidden
            rounded-[28px]
            bg-purple-600
            text-4xl
            font-black
            text-white
            shadow-lg
            shadow-purple-200
        "
                                        >
                                            {profileImageUrl ? (
                                                <img
                                                    src={
                                                        profileImageUrl
                                                    }
                                                    alt="Profile"
                                                    className="
                    h-full
                    w-full
                    object-cover
                "
                                                />
                                            ) : (
                                                initial
                                            )}
                                        </div>

                                        <input
                                            ref={profileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={
                                                handleProfileImageChange
                                            }
                                            className="hidden"
                                        />

                                        <button
                                            type="button"
                                            disabled={
                                                uploadingProfileImage
                                            }
                                            onClick={() =>
                                                profileInputRef.current
                                                    ?.click()
                                            }
                                            title="Change profile picture"
                                            className="
            absolute
            -bottom-2
            -right-2
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            border-4
            border-white
            bg-purple-600
            text-white
            shadow-lg
            transition
            hover:bg-purple-700
            disabled:cursor-not-allowed
            disabled:opacity-60
        "
                                        >
                                            {uploadingProfileImage ? (
                                                <span
                                                    className="
                    h-4
                    w-4
                    animate-spin
                    rounded-full
                    border-2
                    border-white/40
                    border-t-white
                "
                                                />
                                            ) : (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="15"
                                                    height="15"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M12 20h9" />
                                                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                                </svg>
                                            )}
                                        </button>

                                    </div>
                                    <h2 className="mt-6 text-2xl font-black text-[#21172f]">
                                        {user.firstName}{" "}
                                        {user.lastName}
                                    </h2>

                                    <p className="mt-2 break-all text-sm font-medium text-slate-500">
                                        {user.email}
                                    </p>

                                    <div className="mt-5">
                                        {user.emailVerified ? (
                                            <span className="inline-flex rounded-full bg-[#a3e635] px-4 py-2 text-xs font-black text-[#304500]">
                                                ✓ Email Verified
                                            </span>
                                        ) : (
                                            <span className="inline-flex rounded-full bg-yellow-100 px-4 py-2 text-xs font-black text-yellow-700">
                                                Email Not Verified
                                            </span>
                                        )}
                                        {profileMessage && (
                                            <p className="mt-4 text-sm font-bold text-green-700">
                                                {profileMessage}
                                            </p>
                                        )}
                                        <button
                                            type="button"
                                            onClick={openEditProfile}
                                            className="
        mt-5
        inline-flex
        items-center
        gap-2
        rounded-xl
        bg-white
        px-4
        py-2.5
        text-sm
        font-black
        text-purple-700
        shadow-sm
        transition
        hover:bg-purple-50
    "
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="15"
                                                height="15"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M12 20h9" />
                                                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                            </svg>

                                            Edit Profile
                                        </button>
                                    </div>

                                </div>

                                <div className="rounded-[30px] border border-purple-100 bg-white p-7 shadow-xl shadow-purple-100/40 md:p-9">

                                    {!isEditing ? (
                                        <>
                                            <p className="text-sm font-black uppercase tracking-[0.18em] text-purple-500">
                                                Profile Information
                                            </p>

                                            <h2 className="mt-3 text-3xl font-black text-[#21172f]">
                                                Account Details
                                            </h2>

                                            <div className="mt-8 grid gap-5 sm:grid-cols-2">

                                                <div className="rounded-2xl bg-[#f8f5ff] p-5">
                                                    <p className="text-xs font-black uppercase tracking-wider text-purple-500">
                                                        First Name
                                                    </p>

                                                    <p className="mt-2 font-bold text-[#21172f]">
                                                        {user.firstName || "—"}
                                                    </p>
                                                </div>

                                                <div className="rounded-2xl bg-[#efffd5] p-5">
                                                    <p className="text-xs font-black uppercase tracking-wider text-[#719b18]">
                                                        Last Name
                                                    </p>

                                                    <p className="mt-2 font-bold text-[#21172f]">
                                                        {user.lastName || "—"}
                                                    </p>
                                                </div>

                                                <div className="rounded-2xl bg-[#edf6ff] p-5 sm:col-span-2">
                                                    <p className="text-xs font-black uppercase tracking-wider text-blue-500">
                                                        Email Address
                                                    </p>

                                                    <p className="mt-2 break-all font-bold text-[#21172f]">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>

                                            {editMessage && (
                                                <div className="mt-6 rounded-2xl bg-green-50 px-5 py-4 text-sm font-bold text-green-700">
                                                    {editMessage}
                                                </div>
                                            )}

                                            <div className="mt-8 border-t border-purple-100 pt-7">

                                                <button
                                                    type="button"
                                                    onClick={handleLogout}
                                                    disabled={loggingOut}
                                                    className="rounded-2xl bg-purple-600 px-6 py-3 font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {loggingOut
                                                        ? "Signing Out..."
                                                        : "Logout"}
                                                </button>

                                            </div>
                                        </>
                                    ) : (
                                        <form
                                            onSubmit={handleSaveProfile}
                                        >

                                            <p className="text-sm font-black uppercase tracking-[0.18em] text-purple-500">
                                                Edit Profile
                                            </p>

                                            <h2 className="mt-3 text-3xl font-black text-[#21172f]">
                                                Update your details
                                            </h2>

                                            <p className="mt-2 text-sm text-slate-500">
                                                You can update your name,
                                                password and profile picture.
                                                Your email address cannot be changed.
                                            </p>


                                            {/* PROFILE PICTURE */}

                                            <div className="mt-8 flex items-center gap-4 rounded-2xl bg-[#f8f5ff] p-5">

                                                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-purple-600 text-2xl font-black text-white">

                                                    {profileImageUrl ? (
                                                        <img
                                                            src={profileImageUrl}
                                                            alt="Profile"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        initial
                                                    )}

                                                </div>

                                                <div>
                                                    <p className="font-black text-[#21172f]">
                                                        Profile Picture
                                                    </p>

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            uploadingProfileImage
                                                        }
                                                        onClick={() =>
                                                            profileInputRef
                                                                .current
                                                                ?.click()
                                                        }
                                                        className="mt-2 text-sm font-black text-purple-600 hover:text-purple-700 disabled:opacity-50"
                                                    >
                                                        {uploadingProfileImage
                                                            ? "Uploading..."
                                                            : "Change Photo"}
                                                    </button>
                                                </div>

                                            </div>


                                            {/* NAME */}

                                            <div className="mt-7 grid gap-5 sm:grid-cols-2">

                                                <div>
                                                    <label className="mb-2 block text-sm font-black text-[#21172f]">
                                                        First Name
                                                    </label>

                                                    <input
                                                        type="text"
                                                        value={editFirstName}
                                                        onChange={(event) =>
                                                            setEditFirstName(
                                                                event.target.value
                                                            )
                                                        }
                                                        required
                                                        className="w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                                                    />
                                                </div>


                                                <div>
                                                    <label className="mb-2 block text-sm font-black text-[#21172f]">
                                                        Last Name
                                                    </label>

                                                    <input
                                                        type="text"
                                                        value={editLastName}
                                                        onChange={(event) =>
                                                            setEditLastName(
                                                                event.target.value
                                                            )
                                                        }
                                                        required
                                                        className="w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                                                    />
                                                </div>

                                            </div>


                                            {/* EMAIL */}

                                            <div className="mt-5">

                                                <label className="mb-2 block text-sm font-black text-[#21172f]">
                                                    Email Address
                                                </label>

                                                <input
                                                    type="email"
                                                    value={user.email}
                                                    disabled
                                                    className="w-full cursor-not-allowed rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 font-semibold text-slate-500"
                                                />

                                                <p className="mt-2 text-xs font-semibold text-slate-400">
                                                    Email address cannot be changed.
                                                </p>

                                            </div>


                                            {/* PASSWORD */}

                                            <div className="mt-8 border-t border-purple-100 pt-7">

                                                <h3 className="text-lg font-black text-[#21172f]">
                                                    Change Password
                                                </h3>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    Leave these fields empty
                                                    if you do not want to
                                                    change your password.
                                                </p>


                                                <div className="mt-5 grid gap-5">

                                                    <div>
                                                        <label className="mb-2 block text-sm font-black text-[#21172f]">
                                                            Current Password
                                                        </label>

                                                        <input
                                                            type="password"
                                                            value={currentPassword}
                                                            onChange={(event) =>
                                                                setCurrentPassword(
                                                                    event.target.value
                                                                )
                                                            }
                                                            autoComplete="current-password"
                                                            className="w-full rounded-2xl border border-purple-100 px-4 py-3 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                                                        />
                                                    </div>


                                                    <div className="grid gap-5 sm:grid-cols-2">

                                                        <div>
                                                            <label className="mb-2 block text-sm font-black text-[#21172f]">
                                                                New Password
                                                            </label>

                                                            <input
                                                                type="password"
                                                                value={newPassword}
                                                                onChange={(event) =>
                                                                    setNewPassword(
                                                                        event.target.value
                                                                    )
                                                                }
                                                                autoComplete="new-password"
                                                                className="w-full rounded-2xl border border-purple-100 px-4 py-3 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                                                            />
                                                        </div>


                                                        <div>
                                                            <label className="mb-2 block text-sm font-black text-[#21172f]">
                                                                Confirm Password
                                                            </label>

                                                            <input
                                                                type="password"
                                                                value={
                                                                    confirmNewPassword
                                                                }
                                                                onChange={(event) =>
                                                                    setConfirmNewPassword(
                                                                        event.target.value
                                                                    )
                                                                }
                                                                autoComplete="new-password"
                                                                className="w-full rounded-2xl border border-purple-100 px-4 py-3 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                                                            />
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>


                                            {/* BUTTONS */}

                                            <div className="mt-8 flex flex-wrap gap-3">

                                                <button
                                                    type="submit"
                                                    disabled={savingProfile}
                                                    className="rounded-2xl bg-purple-600 px-6 py-3 font-black text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {savingProfile
                                                        ? "Saving..."
                                                        : "Save Changes"}
                                                </button>


                                                <button
                                                    type="button"
                                                    onClick={cancelEditProfile}
                                                    disabled={savingProfile}
                                                    className="rounded-2xl border border-purple-200 bg-white px-6 py-3 font-black text-purple-600 transition hover:bg-purple-50 disabled:opacity-60"
                                                >
                                                    Cancel
                                                </button>

                                            </div>

                                        </form>
                                    )}

                                </div>

                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}