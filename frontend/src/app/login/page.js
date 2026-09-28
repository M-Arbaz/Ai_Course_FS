"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const initialSignup = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
};

export default function LoginPage() {
    const router = useRouter();

    const [mode, setMode] = useState("login");

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const [signup, setSignup] = useState(initialSignup);

    const [authEmail, setAuthEmail] = useState("");
    const [otp, setOtp] = useState("");

    const [resetPassword, setResetPassword] = useState("");
    const [resetConfirmPassword, setResetConfirmPassword] =
        useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const clearMessages = () => {
        setError("");
        setSuccess("");
    };

    const changeMode = (newMode) => {
        clearMessages();
        setMode(newMode);
    };

    const readResponse = async (response) => {
        try {
            return await response.json();
        } catch {
            return {};
        }
    };

    // =====================================================
    // LOGIN
    // =====================================================

    const handleLogin = async (event) => {
        event.preventDefault();

        clearMessages();

        if (!loginEmail.trim() || !loginPassword) {
            setError("Please enter your email and password.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${api()}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        email: loginEmail.trim().toLowerCase(),
                        password: loginPassword,
                    }),
                }
            );

            const data = await readResponse(response);

            if (!response.ok) {
                if (
                    data?.code === "EMAIL_NOT_VERIFIED" ||
                    data?.requiresEmailVerification
                ) {
                    setAuthEmail(
                        data?.email ||
                        loginEmail.trim().toLowerCase()
                    );

                    setOtp("");
                    setMode("verifyEmail");

                    setError(
                        "Your account needs email verification."
                    );

                    return;
                }

                setError(
                    data?.message ||
                    "Unable to sign in."
                );

                return;
            }

            setSuccess(
                data?.message ||
                "Signed in successfully."
            );

            router.push("/");
            router.refresh();
        } catch (error) {
            console.error("Login error:", error);

            setError(
                "Unable to connect to the server. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // SIGNUP
    // =====================================================

    const handleSignupChange = (event) => {
        const { name, value } = event.target;

        setSignup((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSignup = async (event) => {
        event.preventDefault();

        clearMessages();

        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
        } = signup;

        if (
            !firstName.trim() ||
            !lastName.trim() ||
            !email.trim() ||
            !password ||
            !confirmPassword
        ) {
            setError(
                "Please fill in all required fields."
            );
            return;
        }

        if (password !== confirmPassword) {
            setError(
                "Password and confirm password do not match."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${api()}/api/auth/signup`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        firstName: firstName.trim(),
                        lastName: lastName.trim(),
                        email: email
                            .trim()
                            .toLowerCase(),
                        password,
                        confirmPassword,
                    }),
                }
            );

            const data = await readResponse(response);

            if (!response.ok) {
                setError(
                    data?.message ||
                    "Unable to create account."
                );
                return;
            }

            const emailToVerify =
                data?.email ||
                data?.user?.email ||
                email.trim().toLowerCase();

            setAuthEmail(emailToVerify);
            setOtp("");

            setSuccess(
                data?.message ||
                "Verification code sent to your email."
            );

            setMode("verifyEmail");
        } catch (error) {
            console.error("Signup error:", error);

            setError(
                "Unable to connect to the server. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // VERIFY SIGNUP EMAIL
    // =====================================================

    const handleVerifyEmail = async (event) => {
        event.preventDefault();

        clearMessages();

        if (!authEmail.trim()) {
            setError("Email is missing.");
            return;
        }

        if (!/^\d{6}$/.test(otp)) {
            setError(
                "Please enter the 6-digit verification code."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${api()}/api/auth/verify-email`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        email: authEmail
                            .trim()
                            .toLowerCase(),
                        otp,
                    }),
                }
            );

            const data = await readResponse(response);

            if (!response.ok) {
                setError(
                    data?.message ||
                    "Unable to verify email."
                );
                return;
            }

            setOtp("");
            setLoginEmail(
                authEmail.trim().toLowerCase()
            );
            setLoginPassword("");

            setSuccess(
                "Email verified successfully. Please sign in."
            );

            setMode("login");
        } catch (error) {
            console.error(
                "Verify email error:",
                error
            );

            setError(
                "Unable to connect to the server."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // RESEND SIGNUP OTP
    // =====================================================

    const handleResendVerification = async () => {
        clearMessages();

        if (!authEmail.trim()) {
            setError("Email is missing.");
            return;
        }

        try {
            setResending(true);

            const response = await fetch(
                `${api()}/api/auth/resend-verification-otp`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        email: authEmail
                            .trim()
                            .toLowerCase(),
                    }),
                }
            );

            const data = await readResponse(response);

            if (!response.ok) {
                setError(
                    data?.message ||
                    "Unable to resend verification code."
                );
                return;
            }

            setSuccess(
                data?.message ||
                "A new verification code has been sent."
            );
        } catch (error) {
            console.error(
                "Resend verification error:",
                error
            );

            setError(
                "Unable to resend verification code."
            );
        } finally {
            setResending(false);
        }
    };

    // =====================================================
    // FORGOT PASSWORD
    // =====================================================

    const handleForgotPassword = async (event) => {
        event.preventDefault();

        clearMessages();

        if (!authEmail.trim()) {
            setError(
                "Please enter your email address."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${api()}/api/auth/forgot-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        email: authEmail
                            .trim()
                            .toLowerCase(),
                    }),
                }
            );

            const data = await readResponse(response);

            if (!response.ok) {
                setError(
                    data?.message ||
                    "Unable to process password reset."
                );
                return;
            }

            setOtp("");

            setSuccess(
                data?.message ||
                "If an eligible account exists, a reset code has been sent."
            );

            setMode("verifyReset");
        } catch (error) {
            console.error(
                "Forgot password error:",
                error
            );

            setError(
                "Unable to connect to the server."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // VERIFY RESET OTP
    // =====================================================

    const handleVerifyResetOtp = async (event) => {
        event.preventDefault();

        clearMessages();

        if (!/^\d{6}$/.test(otp)) {
            setError(
                "Please enter the 6-digit reset code."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${api()}/api/auth/verify-reset-otp`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        email: authEmail
                            .trim()
                            .toLowerCase(),
                        otp,
                    }),
                }
            );

            const data = await readResponse(response);

            if (!response.ok) {
                setError(
                    data?.message ||
                    "Unable to verify reset code."
                );
                return;
            }

            setSuccess(
                data?.message ||
                "Code verified. Create your new password."
            );

            setResetPassword("");
            setResetConfirmPassword("");

            setMode("resetPassword");
        } catch (error) {
            console.error(
                "Verify reset OTP error:",
                error
            );

            setError(
                "Unable to connect to the server."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // RESET PASSWORD
    // =====================================================

    const handleResetPassword = async (event) => {
        event.preventDefault();

        clearMessages();

        if (
            !resetPassword ||
            !resetConfirmPassword
        ) {
            setError(
                "Please enter and confirm your new password."
            );
            return;
        }

        if (
            resetPassword !==
            resetConfirmPassword
        ) {
            setError(
                "Password and confirm password do not match."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${api()}/api/auth/reset-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        email: authEmail
                            .trim()
                            .toLowerCase(),
                        otp,
                        password: resetPassword,
                        confirmPassword:
                            resetConfirmPassword,
                    }),
                }
            );

            const data = await readResponse(response);

            if (!response.ok) {
                setError(
                    data?.message ||
                    "Unable to reset password."
                );
                return;
            }

            setLoginEmail(
                authEmail.trim().toLowerCase()
            );

            setLoginPassword("");
            setOtp("");
            setResetPassword("");
            setResetConfirmPassword("");

            setSuccess(
                data?.message ||
                "Password reset successfully. Please sign in."
            );

            setMode("login");
        } catch (error) {
            console.error(
                "Reset password error:",
                error
            );

            setError(
                "Unable to connect to the server."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // UI HELPERS
    // =====================================================

    const heading = {
        login: "Welcome Back",
        signup: "Create Your Account",
        verifyEmail: "Verify Your Email",
        forgotPassword: "Forgot Password?",
        verifyReset: "Enter Reset Code",
        resetPassword: "Create New Password",
    }[mode];

    const description = {
        login:
            "Sign in and continue your AI learning journey.",
        signup:
            "Create your account and start learning AI.",
        verifyEmail:
            `We sent a 6-digit verification code to ${authEmail || "your email"}.`,
        forgotPassword:
            "Enter your email and we’ll send you a reset code.",
        verifyReset:
            `Enter the reset code sent to ${authEmail || "your email"}.`,
        resetPassword:
            "Choose a strong new password for your account.",
    }[mode];

    return (
        <>
            <Navbar />
            <main
                className="
                min-h-screen
                bg-gradient-to-br
                from-[#F8F5FF]
                via-white
                to-[#F3FFE2]
                px-4
                py-12
                flex
                items-center
                justify-center
            "
            >
                <div className="w-full max-w-[480px]">
                    <div
                        className="
                        overflow-hidden
                        rounded-[30px]
                        border
                        border-[#EDE9FE]
                        bg-white
                        shadow-[0_24px_80px_rgba(139,92,246,0.14)]
                    "
                    >
                        <div
                            className="
                            h-2
                            bg-gradient-to-r
                            from-[#8B5CF6]
                            via-[#F9A8D4]
                            to-[#A3E635]
                        "
                        />

                        <div className="p-6 sm:p-9">
                            <div className="mb-7 text-center">
                                <div
                                    className="
                                    mx-auto
                                    mb-4
                                    flex
                                    h-14
                                    w-14
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-[#EDE9FE]
                                    text-2xl
                                "
                                >
                                    ✨
                                </div>

                                <h1
                                    className="
                                    text-3xl
                                    font-bold
                                    tracking-tight
                                    text-[#21172f]
                                "
                                >
                                    {heading}
                                </h1>

                                <p
                                    className="
                                    mt-2
                                    text-sm
                                    leading-6
                                    text-gray-500
                                "
                                >
                                    {description}
                                </p>
                            </div>

                            {error && (
                                <div
                                    className="
                                    mb-5
                                    rounded-xl
                                    border
                                    border-red-200
                                    bg-red-50
                                    px-4
                                    py-3
                                    text-sm
                                    text-red-700
                                "
                                >
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div
                                    className="
                                    mb-5
                                    rounded-xl
                                    border
                                    border-lime-200
                                    bg-lime-50
                                    px-4
                                    py-3
                                    text-sm
                                    text-lime-800
                                "
                                >
                                    {success}
                                </div>
                            )}

                            {/* ================= LOGIN ================= */}

                            {mode === "login" && (
                                <form
                                    onSubmit={handleLogin}
                                    className="space-y-5"
                                >
                                    <FieldLabel text="Email Address">
                                        <input
                                            type="email"
                                            autoComplete="email"
                                            value={loginEmail}
                                            onChange={(event) =>
                                                setLoginEmail(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="you@example.com"
                                            className={inputClass}
                                        />
                                    </FieldLabel>

                                    <FieldLabel text="Password">
                                        <PasswordInput
                                            value={loginPassword}
                                            onChange={
                                                setLoginPassword
                                            }
                                            show={showPassword}
                                            onToggle={() =>
                                                setShowPassword(
                                                    (current) =>
                                                        !current
                                                )
                                            }
                                            autoComplete="current-password"
                                        />
                                    </FieldLabel>

                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAuthEmail(
                                                    loginEmail
                                                        .trim()
                                                        .toLowerCase()
                                                );

                                                changeMode(
                                                    "forgotPassword"
                                                );
                                            }}
                                            className="
                                            text-sm
                                            font-semibold
                                            text-[#8B5CF6]
                                            hover:underline
                                        "
                                        >
                                            Forgot password?
                                        </button>
                                    </div>

                                    <PrimaryButton
                                        loading={loading}
                                        text="Sign In"
                                        loadingText="Signing in..."
                                    />

                                    <GoogleDivider />

                                    <GoogleButton />

                                    <p
                                        className="
                                        text-center
                                        text-sm
                                        text-gray-500
                                    "
                                    >
                                        Don&apos;t have an
                                        account?{" "}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                changeMode(
                                                    "signup"
                                                )
                                            }
                                            className="
                                            font-bold
                                            text-[#8B5CF6]
                                            hover:underline
                                        "
                                        >
                                            Create Account
                                        </button>
                                    </p>
                                </form>
                            )}

                            {/* ================= SIGNUP ================= */}

                            {mode === "signup" && (
                                <form
                                    onSubmit={handleSignup}
                                    className="space-y-5"
                                >
                                    <div
                                        className="
                                        grid
                                        grid-cols-1
                                        gap-4
                                        sm:grid-cols-2
                                    "
                                    >
                                        <FieldLabel text="First Name">
                                            <input
                                                name="firstName"
                                                value={
                                                    signup.firstName
                                                }
                                                onChange={
                                                    handleSignupChange
                                                }
                                                autoComplete="given-name"
                                                placeholder="First name"
                                                className={
                                                    inputClass
                                                }
                                            />
                                        </FieldLabel>

                                        <FieldLabel text="Last Name">
                                            <input
                                                name="lastName"
                                                value={
                                                    signup.lastName
                                                }
                                                onChange={
                                                    handleSignupChange
                                                }
                                                autoComplete="family-name"
                                                placeholder="Last name"
                                                className={
                                                    inputClass
                                                }
                                            />
                                        </FieldLabel>
                                    </div>

                                    <FieldLabel text="Email Address">
                                        <input
                                            name="email"
                                            type="email"
                                            value={signup.email}
                                            onChange={
                                                handleSignupChange
                                            }
                                            autoComplete="email"
                                            placeholder="you@example.com"
                                            className={inputClass}
                                        />
                                    </FieldLabel>

                                    <FieldLabel text="Password">
                                        <PasswordInput
                                            value={
                                                signup.password
                                            }
                                            onChange={(value) =>
                                                setSignup(
                                                    (current) => ({
                                                        ...current,
                                                        password:
                                                            value,
                                                    })
                                                )
                                            }
                                            show={showPassword}
                                            onToggle={() =>
                                                setShowPassword(
                                                    (current) =>
                                                        !current
                                                )
                                            }
                                            autoComplete="new-password"
                                        />
                                    </FieldLabel>

                                    <FieldLabel text="Confirm Password">
                                        <PasswordInput
                                            value={
                                                signup.confirmPassword
                                            }
                                            onChange={(value) =>
                                                setSignup(
                                                    (current) => ({
                                                        ...current,
                                                        confirmPassword:
                                                            value,
                                                    })
                                                )
                                            }
                                            show={
                                                showConfirmPassword
                                            }
                                            onToggle={() =>
                                                setShowConfirmPassword(
                                                    (current) =>
                                                        !current
                                                )
                                            }
                                            autoComplete="new-password"
                                        />
                                    </FieldLabel>

                                    <p
                                        className="
                                        rounded-xl
                                        bg-[#F8F5FF]
                                        px-4
                                        py-3
                                        text-xs
                                        leading-5
                                        text-gray-500
                                    "
                                    >
                                        Use at least 8 characters
                                        with letters and numbers.
                                    </p>

                                    <PrimaryButton
                                        loading={loading}
                                        text="Create Account"
                                        loadingText="Creating account..."
                                    />

                                    <GoogleDivider />

                                    <GoogleButton />

                                    <p
                                        className="
                                        text-center
                                        text-sm
                                        text-gray-500
                                    "
                                    >
                                        Already have an account?{" "}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                changeMode(
                                                    "login"
                                                )
                                            }
                                            className="
                                            font-bold
                                            text-[#8B5CF6]
                                            hover:underline
                                        "
                                        >
                                            Sign In
                                        </button>
                                    </p>
                                </form>
                            )}

                            {/* ============== VERIFY EMAIL ============== */}

                            {mode === "verifyEmail" && (
                                <form
                                    onSubmit={
                                        handleVerifyEmail
                                    }
                                    className="space-y-5"
                                >
                                    <OtpInput
                                        value={otp}
                                        onChange={setOtp}
                                    />

                                    <PrimaryButton
                                        loading={loading}
                                        text="Verify Email"
                                        loadingText="Verifying..."
                                    />

                                    <button
                                        type="button"
                                        disabled={resending}
                                        onClick={
                                            handleResendVerification
                                        }
                                        className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-[#C4B5FD]
                                        px-4
                                        py-3
                                        text-sm
                                        font-bold
                                        text-[#8B5CF6]
                                        transition
                                        hover:bg-[#F8F5FF]
                                        disabled:opacity-50
                                    "
                                    >
                                        {resending
                                            ? "Sending..."
                                            : "Resend Code"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            changeMode("login")
                                        }
                                        className={backClass}
                                    >
                                        ← Back to Sign In
                                    </button>
                                </form>
                            )}

                            {/* ============== FORGOT PASSWORD ============== */}

                            {mode === "forgotPassword" && (
                                <form
                                    onSubmit={
                                        handleForgotPassword
                                    }
                                    className="space-y-5"
                                >
                                    <FieldLabel text="Email Address">
                                        <input
                                            type="email"
                                            autoComplete="email"
                                            value={authEmail}
                                            onChange={(event) =>
                                                setAuthEmail(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="you@example.com"
                                            className={inputClass}
                                        />
                                    </FieldLabel>

                                    <PrimaryButton
                                        loading={loading}
                                        text="Send Reset Code"
                                        loadingText="Sending..."
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            changeMode("login")
                                        }
                                        className={backClass}
                                    >
                                        ← Back to Sign In
                                    </button>
                                </form>
                            )}

                            {/* ============== VERIFY RESET ============== */}

                            {mode === "verifyReset" && (
                                <form
                                    onSubmit={
                                        handleVerifyResetOtp
                                    }
                                    className="space-y-5"
                                >
                                    <OtpInput
                                        value={otp}
                                        onChange={setOtp}
                                    />

                                    <PrimaryButton
                                        loading={loading}
                                        text="Verify Reset Code"
                                        loadingText="Verifying..."
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            changeMode(
                                                "forgotPassword"
                                            )
                                        }
                                        className={backClass}
                                    >
                                        ← Request another code
                                    </button>
                                </form>
                            )}

                            {/* ============== RESET PASSWORD ============== */}

                            {mode === "resetPassword" && (
                                <form
                                    onSubmit={
                                        handleResetPassword
                                    }
                                    className="space-y-5"
                                >
                                    <FieldLabel text="New Password">
                                        <PasswordInput
                                            value={
                                                resetPassword
                                            }
                                            onChange={
                                                setResetPassword
                                            }
                                            show={showPassword}
                                            onToggle={() =>
                                                setShowPassword(
                                                    (current) =>
                                                        !current
                                                )
                                            }
                                            autoComplete="new-password"
                                        />
                                    </FieldLabel>

                                    <FieldLabel text="Confirm New Password">
                                        <PasswordInput
                                            value={
                                                resetConfirmPassword
                                            }
                                            onChange={
                                                setResetConfirmPassword
                                            }
                                            show={
                                                showConfirmPassword
                                            }
                                            onToggle={() =>
                                                setShowConfirmPassword(
                                                    (current) =>
                                                        !current
                                                )
                                            }
                                            autoComplete="new-password"
                                        />
                                    </FieldLabel>

                                    <PrimaryButton
                                        loading={loading}
                                        text="Reset Password"
                                        loadingText="Resetting password..."
                                    />
                                </form>
                            )}
                        </div>
                    </div>

                    <p
                        className="
                        mt-5
                        text-center
                        text-xs
                        leading-5
                        text-gray-400
                    "
                    >
                        Secure authentication for AI Course.
                    </p>
                </div>
            </main>
            <Footer />
        </>
    );
}


// =========================================================
// SMALL UI COMPONENTS
// =========================================================

const inputClass = `
    w-full
    rounded-xl
    border
    border-gray-200
    bg-white
    px-4
    py-3.5
    text-[#21172f]
    outline-none
    transition
    placeholder:text-gray-400
    focus:border-[#8B5CF6]
    focus:ring-4
    focus:ring-[#EDE9FE]
`;

const backClass = `
    w-full
    text-center
    text-sm
    font-semibold
    text-gray-500
    transition
    hover:text-[#8B5CF6]
`;

function FieldLabel({ text, children }) {
    return (
        <label className="block">
            <span
                className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-[#21172f]
                "
            >
                {text}
            </span>

            {children}
        </label>
    );
}

function PasswordInput({
    value,
    onChange,
    show,
    onToggle,
    autoComplete,
}) {
    return (
        <div className="relative">
            <input
                type={show ? "text" : "password"}
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                autoComplete={autoComplete}
                placeholder="••••••••"
                className={`${inputClass} pr-16`}
            />

            <button
                type="button"
                onClick={onToggle}
                className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-sm
                    font-semibold
                    text-[#8B5CF6]
                "
            >
                {show ? "Hide" : "Show"}
            </button>
        </div>
    );
}

function OtpInput({ value, onChange }) {
    return (
        <FieldLabel text="6-Digit Code">
            <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6)
                    )
                }
                placeholder="000000"
                className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    px-4
                    py-4
                    text-center
                    text-2xl
                    font-bold
                    tracking-[0.35em]
                    text-[#21172f]
                    outline-none
                    transition
                    focus:border-[#8B5CF6]
                    focus:ring-4
                    focus:ring-[#EDE9FE]
                "
            />
        </FieldLabel>
    );
}

function PrimaryButton({
    loading,
    text,
    loadingText,
}) {
    return (
        <button
            type="submit"
            disabled={loading}
            className="
                w-full
                rounded-xl
                bg-[#8B5CF6]
                px-5
                py-3.5
                font-bold
                text-white
                transition
                hover:bg-[#7C3AED]
                disabled:cursor-not-allowed
                disabled:opacity-60
            "
        >
            {loading ? loadingText : text}
        </button>
    );
}

function GoogleDivider() {
    return (
        <div
            className="
                flex
                items-center
                gap-3
                py-1
            "
        >
            <div className="h-px flex-1 bg-gray-200" />

            <span
                className="
                    text-xs
                    font-medium
                    text-gray-400
                "
            >
                OR
            </span>

            <div className="h-px flex-1 bg-gray-200" />
        </div>
    );
}

function GoogleButton() {
    return (
        <button
            type="button"
            disabled
            title="Google Sign-In will be connected next"
            className="
                flex
                w-full
                items-center
                justify-center
                gap-3
                rounded-xl
                border
                border-gray-200
                bg-white
                px-5
                py-3.5
                font-semibold
                text-[#21172f]
                opacity-70
            "
        >
            <span
                className="
                    flex
                    h-6
                    w-6
                    items-center
                    justify-center
                    rounded-full
                    bg-[#DBEAFE]
                    text-sm
                    font-bold
                "
            >
                G
            </span>

            Continue with Google
        </button>
    );
}