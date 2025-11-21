import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

// Brand colors from design system
export const colors = {
  primary: '#bb2c29',        // hsl(0 73% 41%)
  primaryDark: '#8b2120',    // darker shade
  primaryLight: '#e63946',   // lighter shade
  background: '#f8f9fa',
  foreground: '#1a1a1a',
  border: '#e5e7eb',
  muted: '#6b7280',
  success: '#16a34a',
  warning: '#f59e0b',
  info: '#0891b2',
};

interface BaseEmailProps {
  previewText: string;
  children: React.ReactNode;
}

export const BaseEmail = ({ previewText, children }: BaseEmailProps) => (
  <Html lang="de">
    <Head />
    <Preview>{previewText}</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Heading style={headerTitle}>Fahrerexpress-Agentur</Heading>
          <Text style={headerSubtitle}>LKW CE Fahrer & Baumaschinenführer</Text>
        </Section>

        {/* Content */}
        <Section style={content}>
          {children}
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Heading style={footerTitle}>Fahrerexpress-Agentur</Heading>
          <Text style={footerText}>
            📧 info@kraftfahrer-mieten.com<br />
            📱 01577 1442285
          </Text>
          <Text style={footerSubtext}>
            Günter Killer<br />
            Vermittlung gewerblicher Fahrer
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

// Styles
const main = {
  backgroundColor: colors.background,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  padding: '20px 0',
};

const container = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  maxWidth: '600px',
  margin: '0 auto',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
};

const header = {
  background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
  padding: '30px 40px',
  textAlign: 'center' as const,
};

const headerTitle = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
};

const headerSubtitle = {
  color: '#ffffff',
  fontSize: '14px',
  margin: '5px 0 0 0',
  opacity: '0.95',
};

const content = {
  padding: '40px',
};

const footer = {
  backgroundColor: colors.background,
  padding: '30px 40px',
  textAlign: 'center' as const,
  borderTop: `1px solid ${colors.border}`,
};

const footerTitle = {
  color: colors.foreground,
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
};

const footerText = {
  color: colors.muted,
  fontSize: '14px',
  margin: '0 0 15px 0',
  lineHeight: '1.6',
};

const footerSubtext = {
  color: colors.muted,
  fontSize: '12px',
  margin: '0',
  lineHeight: '1.5',
};

// Reusable box styles
export const boxStyles = {
  infoBox: {
    backgroundColor: '#fef3f2',
    borderLeft: `4px solid ${colors.primary}`,
    padding: '20px',
    marginBottom: '25px',
    borderRadius: '4px',
  },
  successBox: {
    backgroundColor: '#f0fdf4',
    borderLeft: `4px solid ${colors.success}`,
    padding: '20px',
    marginBottom: '25px',
    borderRadius: '4px',
  },
  warningBox: {
    backgroundColor: '#fffbeb',
    borderLeft: `4px solid ${colors.warning}`,
    padding: '20px',
    marginBottom: '25px',
    borderRadius: '4px',
  },
  highlightBox: {
    backgroundColor: '#ffffff',
    border: `2px solid ${colors.primary}`,
    padding: '20px',
    marginBottom: '20px',
    borderRadius: '4px',
  },
};

export const textStyles = {
  heading2: {
    color: colors.foreground,
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '0 0 20px 0',
  },
  heading3: {
    color: colors.primary,
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0 0 15px 0',
  },
  paragraph: {
    color: colors.foreground,
    fontSize: '14px',
    lineHeight: '1.6',
    margin: '0 0 15px 0',
  },
  strong: {
    fontWeight: 'bold',
    color: colors.foreground,
  },
  muted: {
    color: colors.muted,
    fontSize: '13px',
  },
};

export default BaseEmail;
