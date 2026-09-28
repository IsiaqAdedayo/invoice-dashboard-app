"use client";

import { api } from "@/lib/api";
import { theme } from "@/styles/theme";
import { Spin } from "antd";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Suspense, useState, type SVGProps } from "react";
import styled, { keyframes } from "styled-components";
import * as Yup from "yup";

// ─── Icons ─────────────────────────────────────────────────────────────────────

const IconBase = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  />
);

const LightningIcon = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <path d="M13 2 4 13h6l-1 9 9-11h-6l1-9Z" />
  </IconBase>
);

const ChartIcon = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <path d="M4 19h16" />
    <path d="M7 15V9" />
    <path d="M12 15V5" />
    <path d="M17 15v-7" />
  </IconBase>
);

const ShieldIcon = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <path d="M12 3 5 6v6c0 4.5 2.8 8.3 7 10 4.2-1.7 7-5.5 7-10V6l-7-3Z" />
    <path d="m9.5 12 1.7 1.7 3.3-4" />
  </IconBase>
);

const GlobeIcon = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a15 15 0 0 1 0 18" />
    <path d="M12 3a15 15 0 0 0 0 18" />
  </IconBase>
);

const EyeIcon = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </IconBase>
);

const EyeOffIcon = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <path d="m3 3 18 18" />
    <path d="M10.6 10.6A2 2 0 0 0 13.4 13.4" />
    <path d="M9.9 5.2A11.5 11.5 0 0 1 12 5c6.5 0 10 7 10 7a16.6 16.6 0 0 1-4.2 5.3" />
    <path d="M6.2 6.1A15.5 15.5 0 0 0 2 12s3.5 7 10 7a11.8 11.8 0 0 0 4.9-1.1" />
  </IconBase>
);

const AlertIcon = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <path d="M12 3.5 2.8 18.5A1.5 1.5 0 0 0 4.1 20.5h15.8a1.5 1.5 0 0 0 1.3-2l-9.2-15Z" />
    <path d="M12 9v4.5" />
    <circle cx="12" cy="16.5" r="0.8" fill="currentColor" stroke="none" />
  </IconBase>
);

// ─── Animations ───────────────────────────────────────────────────────────────

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
`;

// ─── Styled Components ────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

// Left panel - dark brand side
const BrandPanel = styled.div`
  width: 45%;
  background: ${theme.colors.sidebarBg};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 100%;
    min-height: 220px;
    padding: 28px 24px;
  }
`;

const BrandBg = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -40%;
    left: -20%;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(99, 102, 241, 0.15) 0%,
      transparent 70%
    );
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -20%;
    right: -10%;
    width: 350px;
    height: 350px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(16, 185, 129, 0.08) 0%,
      transparent 70%
    );
  }
`;

const BrandLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  z-index: 1;
`;

const LogoMark = styled.div`
  width: 38px;
  height: 38px;
  background: ${theme.colors.primary};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 800;
  color: #fff;
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
  letter-spacing: -0.5px;
`;

const BrandName = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.3px;
`;

const BrandContent = styled.div`
  position: relative;
  z-index: 1;
`;

const BrandHeadline = styled.h2`
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  letter-spacing: -0.5px;
  margin: 0 0 14px;

  span {
    background: linear-gradient(135deg, #818cf8, #34d399);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  @media (max-width: 768px) {
    font-size: 22px;
  }
`;

const BrandSub = styled.p`
  font-size: 14px;
  color: ${theme.colors.sidebarText};
  line-height: 1.6;
  margin: 0 0 32px;
  max-width: 320px;
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FeatureIcon = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.9);

  svg {
    width: 14px;
    height: 14px;
  }
`;

const FeatureText = styled.span`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
`;

// Floating stat cards on the left
const FloatingCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px 18px;
  backdrop-filter: blur(12px);
  position: absolute;
  z-index: 1;
`;

const FloatingLabel = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FloatingValue = styled.div`
  font-family: ${theme.fonts.mono};
  font-size: 18px;
  font-weight: 600;
  color: #fff;
`;

const FloatingDelta = styled.span<{ $up?: boolean }>`
  font-size: 11px;
  color: ${({ $up }) => ($up ? "#34D399" : "#F87171")};
`;

// Right panel - form side
const FormPanel = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background: ${theme.colors.pageBg};
`;

const FormBox = styled(motion.div)`
  width: 100%;
  max-width: 380px;
`;

const FormHeader = styled.div`
  margin-bottom: 28px;
`;

const FormTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${theme.colors.textPrimary};
  letter-spacing: -0.4px;
  margin: 0 0 6px;
`;

const FormSubtitle = styled.p`
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  margin: 0;
`;

const FieldGroup = styled.div`
  margin-bottom: 16px;
`;

const FieldLabel = styled.label`
  display: block;
  font-size: 12.5px;
  font-weight: 600;
  color: ${theme.colors.textSecondary};
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const StyledField = styled(Field)<{ $hasError?: boolean }>`
  width: 100%;
  height: 44px;
  border: 1.5px solid
    ${({ $hasError }) =>
      $hasError ? theme.colors.danger : theme.colors.cardBorder};
  border-radius: 10px;
  padding: 0 14px;
  font-size: 14px;
  font-family: ${theme.fonts.sans};
  background: ${theme.colors.cardBg};
  color: ${theme.colors.textPrimary};
  transition: all 0.15s;
  outline: none;

  &:focus {
    border-color: ${({ $hasError }) =>
      $hasError ? theme.colors.danger : theme.colors.primary};
    box-shadow: 0 0 0 3px
      ${({ $hasError }) =>
        $hasError ? "rgba(239,68,68,0.1)" : "rgba(99,102,241,0.1)"};
  }

  &::placeholder {
    color: ${theme.colors.textHint};
  }
`;

const FieldError = styled.span`
  display: block;
  font-size: 12px;
  color: ${theme.colors.danger};
  margin-top: 5px;
  font-weight: 500;
`;

const PasswordToggle = styled.div`
  position: relative;
`;

const ToggleBtn = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  cursor: pointer;
  color: ${theme.colors.textHint};
  padding: 4px;
  transition: color 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    color: ${theme.colors.textSecondary};
  }
`;

const ForgotLink = styled.a`
  display: block;
  text-align: right;
  font-size: 12px;
  color: ${theme.colors.primary};
  cursor: pointer;
  margin-top: 6px;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    color: ${theme.colors.primaryHover};
  }
`;

const SubmitBtn = styled(motion.button)<{ $loading?: boolean }>`
  width: 100%;
  height: 46px;
  background: ${theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14.5px;
  font-weight: 600;
  font-family: ${theme.fonts.sans};
  cursor: ${({ $loading }) => ($loading ? "not-allowed" : "pointer")};
  opacity: ${({ $loading }) => ($loading ? 0.7 : 1)};
  transition: opacity 0.15s;
  margin-top: 20px;
  letter-spacing: 0.1px;
  box-shadow: ${theme.shadow.indigo};
  position: relative;
  overflow: hidden;

  &:hover:not(:disabled) {
    background: ${theme.colors.primaryHover};
  }
`;

const LoadingDots = styled.span`
  display: inline-flex;
  gap: 4px;
  align-items: center;

  span {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.8);
    animation: ${pulse} 1s ease-in-out infinite;
    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
`;

const SwitchText = styled.p`
  text-align: center;
  font-size: 13px;
  color: ${theme.colors.textSecondary};
  margin: 16px 0 0;

  a {
    color: ${theme.colors.primary};
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;

    &:hover {
      color: ${theme.colors.primaryHover};
    }
  }
`;

const GlobalError = styled.div`
  background: ${theme.colors.dangerLight};
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 9px;
  padding: 10px 14px;
  font-size: 13px;
  color: ${theme.colors.danger};
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
`;

// ─── Schema ───────────────────────────────────────────────────────────────────

const LoginSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "At least 6 characters")
    .required("Password is required"),
});

// ─── Component ────────────────────────────────────────────────────────────────

function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [globalError, setGlobalError] = useState("");

  if (typeof window !== "undefined")
    return (
      <PageWrapper>
        {/* Left brand panel */}
        <BrandPanel>
          <BrandBg />

          <BrandLogo>
            <LogoMark>Pv</LogoMark>
            <BrandName>Payvance</BrandName>
          </BrandLogo>

          <BrandContent>
            <BrandHeadline>
              Invoice management
              <br />
              <span>built for speed.</span>
            </BrandHeadline>
            <BrandSub>
              Send invoices, collect payments, and track everything in one
              place.
            </BrandSub>

            <FeatureList>
              {[
                {
                  icon: LightningIcon,
                  text: "Create & send invoices in seconds",
                },
                { icon: ChartIcon, text: "Real-time payment analytics" },
                {
                  icon: ShieldIcon,
                  text: "Bank-grade security & encryption",
                },
                {
                  icon: GlobeIcon,
                  text: "Multi-currency support (₦, $, €, £)",
                },
              ].map((f, i) => {
                const Icon = f.icon;

                return (
                  <Feature key={i}>
                    <FeatureIcon>
                      <Icon />
                    </FeatureIcon>
                    <FeatureText>{f.text}</FeatureText>
                  </Feature>
                );
              })}
            </FeatureList>

            {/* Floating stat cards */}
            <FloatingCard
              style={{ bottom: "180px", right: "-10px" }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <FloatingLabel>This month</FloatingLabel>
              <FloatingValue>
                ₦4.2M <FloatingDelta $up>↑ 18%</FloatingDelta>
              </FloatingValue>
            </FloatingCard>

            <FloatingCard
              style={{ bottom: "80px", right: "30px" }}
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            >
              <FloatingLabel>Invoices paid</FloatingLabel>
              <FloatingValue>94.2%</FloatingValue>
            </FloatingCard>
          </BrandContent>

          <div
            style={{
              position: "relative",
              zIndex: 1,
              fontSize: "12px",
              color: "rgba(255,255,255,0.2)",
            }}
          >
            © 2026 Payvance · All rights reserved
          </div>
        </BrandPanel>

        {/* Right form panel */}
        <FormPanel>
          <FormBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <FormHeader>
              <FormTitle>Welcome back</FormTitle>
              <FormSubtitle>Sign in to your Payvance account</FormSubtitle>
            </FormHeader>

            {globalError && (
              <GlobalError>
                <AlertIcon />
                <span>{globalError}</span>
              </GlobalError>
            )}

            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={LoginSchema}
              onSubmit={async (values, { setSubmitting }) => {
                setGlobalError("");
                try {
                  const res = await signIn("credentials", {
                    ...values,
                    redirect: false,
                  });
                  if (res?.ok) {
                    const session = await api.post("/auth/login", values);
                    router.push(
                      session.user?.role === "admin"
                        ? "/dashboard/admin"
                        : "/dashboard/customer",
                    );
                  } else {
                    setGlobalError(
                      "Invalid email or password. Please try again.",
                    );
                  }
                } catch {
                  setGlobalError("Something went wrong. Please try again.");
                }
                setSubmitting(false);
              }}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form>
                  <FieldGroup>
                    <FieldLabel htmlFor="email">Email address</FieldLabel>
                    <StyledField
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@company.com"
                      $hasError={!!(errors.email && touched.email)}
                    />
                    <ErrorMessage
                      name="email"
                      render={(msg) => <FieldError>{msg}</FieldError>}
                    />
                  </FieldGroup>

                  <FieldGroup>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <PasswordToggle>
                      <StyledField
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        $hasError={!!(errors.password && touched.password)}
                      />
                      <ToggleBtn
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </ToggleBtn>
                    </PasswordToggle>
                    <ErrorMessage
                      name="password"
                      render={(msg) => <FieldError>{msg}</FieldError>}
                    />
                    <ForgotLink href="/forgot-password">
                      Forgot password?
                    </ForgotLink>
                  </FieldGroup>

                  <SubmitBtn
                    type="submit"
                    $loading={isSubmitting}
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {isSubmitting ? (
                      <LoadingDots>
                        <span />
                        <span />
                        <span />
                      </LoadingDots>
                    ) : (
                      "Sign in"
                    )}
                  </SubmitBtn>
                </Form>
              )}
            </Formik>

            <SwitchText>
              Don&apos;t have an account?{" "}
              <a onClick={() => router.push("/signup")}>Create one free</a>
            </SwitchText>
          </FormBox>
        </FormPanel>
      </PageWrapper>
    );
}

const SignIn = () => {
  return (
    <Suspense fallback={<Spin spinning={true} size="large" fullscreen />}>
      <LoginPage />
    </Suspense>
  );
};

export default SignIn;
