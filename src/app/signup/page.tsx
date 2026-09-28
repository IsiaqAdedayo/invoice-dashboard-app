"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { theme } from "@/styles/theme";
import { api } from "@/lib/api";

// Reuse the same layout primitives from login
const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  @media (max-width: 768px) { flex-direction: column; }
`;

const BrandPanel = styled.div`
  width: 45%;
  background: ${theme.colors.sidebarBg};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px;
  position: relative;
  overflow: hidden;
  @media (max-width: 768px) { width: 100%; min-height: 180px; padding: 28px 24px; }

  &::before {
    content: '';
    position: absolute;
    top: -30%;
    right: -10%;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
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
  box-shadow: 0 6px 20px rgba(99,102,241,0.4);
  letter-spacing: -0.5px;
`;

const BrandMiddle = styled.div`
  position: relative;
  z-index: 1;
`;

const Headline = styled.h2`
  font-size: 30px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  letter-spacing: -0.5px;
  margin: 0 0 12px;

  span {
    background: linear-gradient(135deg, #818CF8, #34D399);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const Sub = styled.p`
  font-size: 14px;
  color: ${theme.colors.sidebarText};
  line-height: 1.6;
  margin: 0 0 28px;
`;

const PlanCard = styled.div`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 16px 18px;
  margin-bottom: 12px;
`;

const PlanName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.8);
  margin-bottom: 4px;
`;

const PlanDesc = styled.div`
  font-size: 12px;
  color: ${theme.colors.sidebarText};
`;

const PlanBadge = styled.span`
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  background: rgba(99,102,241,0.2);
  color: #818CF8;
  margin-left: 8px;
  letter-spacing: 0.3px;
`;

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
  max-width: 400px;
`;

const FormTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${theme.colors.textPrimary};
  letter-spacing: -0.4px;
  margin: 0 0 6px;
`;

const FormSub = styled.p`
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  margin: 0 0 28px;
`;

const FieldGroup = styled.div`
  margin-bottom: 14px;
`;

const FieldLabel = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: ${theme.colors.textSecondary};
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const FieldRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const StyledField = styled(Field)<{ $hasError?: boolean }>`
  width: 100%;
  height: 44px;
  border: 1.5px solid ${({ $hasError }) => $hasError ? theme.colors.danger : theme.colors.cardBorder};
  border-radius: 10px;
  padding: 0 14px;
  font-size: 14px;
  font-family: ${theme.fonts.sans};
  background: ${theme.colors.cardBg};
  color: ${theme.colors.textPrimary};
  transition: all 0.15s;
  outline: none;

  &:focus {
    border-color: ${({ $hasError }) => $hasError ? theme.colors.danger : theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ $hasError }) => $hasError ? "rgba(239,68,68,0.1)" : "rgba(99,102,241,0.1)"};
  }

  &::placeholder { color: ${theme.colors.textHint}; }
`;

const FieldError = styled.span`
  display: block;
  font-size: 12px;
  color: ${theme.colors.danger};
  margin-top: 4px;
  font-weight: 500;
`;

const PasswordStrength = styled.div<{ $strength: number }>`
  display: flex;
  gap: 4px;
  margin-top: 8px;

  span {
    flex: 1;
    height: 3px;
    border-radius: 2px;
    background: ${theme.colors.cardBorder};
    transition: background 0.3s;
  }

  span:nth-child(-n+${({ $strength }) => $strength}) {
    background: ${({ $strength }) =>
      $strength <= 1 ? theme.colors.danger :
      $strength <= 2 ? theme.colors.warning :
      theme.colors.success
    };
  }
`;

const StrengthLabel = styled.span<{ $strength: number }>`
  font-size: 11px;
  color: ${({ $strength }) =>
    $strength <= 1 ? theme.colors.danger :
    $strength <= 2 ? theme.colors.warning :
    theme.colors.success
  };
  font-weight: 500;
`;

const TermsText = styled.p`
  font-size: 12px;
  color: ${theme.colors.textHint};
  margin: 14px 0 0;
  line-height: 1.5;

  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    font-weight: 500;
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
  cursor: ${({ $loading }) => $loading ? "not-allowed" : "pointer"};
  opacity: ${({ $loading }) => $loading ? 0.7 : 1};
  margin-top: 20px;
  box-shadow: ${theme.shadow.indigo};
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
  }
`;

// ─── Password Strength ────────────────────────────────────────────────────────

function getPasswordStrength(password: string): number {
  if (!password) return 0;
  let s = 0;
  if (password.length >= 8) s++;
  if (/[A-Z]/.test(password)) s++;
  if (/[0-9]/.test(password)) s++;
  if (/[^A-Za-z0-9]/.test(password)) s++;
  return s;
}

const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

// ─── Schema ───────────────────────────────────────────────────────────────────

const SignupSchema = Yup.object({
  firstName: Yup.string().required("Required"),
  lastName: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  company: Yup.string().required("Required"),
  password: Yup.string()
    .min(8, "At least 8 characters")
    .matches(/[A-Z]/, "Include one uppercase letter")
    .required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Required"),
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function SignupPage() {
  const router = useRouter();
  const [strength, setStrength] = useState(0);

  return (
    <PageWrapper>
      <BrandPanel>
        <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative", zIndex: 1 }}>
          <LogoMark>Pv</LogoMark>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>Payvance</span>
        </div>

        <BrandMiddle>
          <Headline>
            Start managing<br />
            <span>invoices smarter.</span>
          </Headline>
          <Sub>Join 2,400+ businesses that trust Payvance for their invoice and payment workflows.</Sub>

          <PlanCard>
            <PlanName>Free plan <PlanBadge>FREE FOREVER</PlanBadge></PlanName>
            <PlanDesc>Up to 10 invoices/month, 2 team members, basic analytics</PlanDesc>
          </PlanCard>
          <PlanCard>
            <PlanName>Pro plan <PlanBadge>MOST POPULAR</PlanBadge></PlanName>
            <PlanDesc>Unlimited invoices, custom branding, priority support</PlanDesc>
          </PlanCard>
        </BrandMiddle>

        <div style={{ position: "relative", zIndex: 1, fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
          © 2026 Payvance
        </div>
      </BrandPanel>

      <FormPanel>
        <FormBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <FormTitle>Create your account</FormTitle>
          <FormSub>Get started — it&apos;s free, no credit card needed.</FormSub>

          <Formik
            initialValues={{ firstName: "", lastName: "", email: "", company: "", password: "", confirmPassword: "" }}
            validationSchema={SignupSchema}
            onSubmit={async (values, { setSubmitting, setErrors }) => {
              try {
                await api.post("/auth/signup", values);
                router.push("/login?registered=true");
              } catch {
                setErrors({ email: "An account with this email already exists." });
              }
              setSubmitting(false);
            }}
          >
            {({ errors, touched, isSubmitting, values }) => {
              const s = getPasswordStrength(values.password);
              if (s !== strength) setStrength(s);
              return (
                <Form>
                  <FieldRow>
                    <FieldGroup>
                      <FieldLabel>First name</FieldLabel>
                      <StyledField name="firstName" placeholder="Adedayo" $hasError={!!(errors.firstName && touched.firstName)} />
                      <ErrorMessage name="firstName" render={msg => <FieldError>{msg}</FieldError>} />
                    </FieldGroup>
                    <FieldGroup>
                      <FieldLabel>Last name</FieldLabel>
                      <StyledField name="lastName" placeholder="A." $hasError={!!(errors.lastName && touched.lastName)} />
                      <ErrorMessage name="lastName" render={msg => <FieldError>{msg}</FieldError>} />
                    </FieldGroup>
                  </FieldRow>

                  <FieldGroup>
                    <FieldLabel>Work email</FieldLabel>
                    <StyledField name="email" type="email" placeholder="you@company.com" $hasError={!!(errors.email && touched.email)} />
                    <ErrorMessage name="email" render={msg => <FieldError>{msg}</FieldError>} />
                  </FieldGroup>

                  <FieldGroup>
                    <FieldLabel>Company name</FieldLabel>
                    <StyledField name="company" placeholder="Acme Corp" $hasError={!!(errors.company && touched.company)} />
                    <ErrorMessage name="company" render={msg => <FieldError>{msg}</FieldError>} />
                  </FieldGroup>

                  <FieldGroup>
                    <FieldLabel>Password</FieldLabel>
                    <StyledField name="password" type="password" placeholder="Min. 8 characters" $hasError={!!(errors.password && touched.password)} />
                    {values.password && (
                      <>
                        <PasswordStrength $strength={s}>
                          <span /><span /><span /><span />
                        </PasswordStrength>
                        <StrengthLabel $strength={s}>{strengthLabels[s]}</StrengthLabel>
                      </>
                    )}
                    <ErrorMessage name="password" render={msg => <FieldError>{msg}</FieldError>} />
                  </FieldGroup>

                  <FieldGroup>
                    <FieldLabel>Confirm password</FieldLabel>
                    <StyledField name="confirmPassword" type="password" placeholder="Repeat password" $hasError={!!(errors.confirmPassword && touched.confirmPassword)} />
                    <ErrorMessage name="confirmPassword" render={msg => <FieldError>{msg}</FieldError>} />
                  </FieldGroup>

                  <SubmitBtn
                    type="submit"
                    $loading={isSubmitting}
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {isSubmitting ? "Creating account..." : "Create account →"}
                  </SubmitBtn>

                  <TermsText>
                    By signing up, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
                  </TermsText>
                </Form>
              );
            }}
          </Formik>

          <SwitchText>
            Already have an account? <a onClick={() => router.push("/login")}>Sign in</a>
          </SwitchText>
        </FormBox>
      </FormPanel>
    </PageWrapper>
  );
}
