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

// Mobile-optimized responsive styles
const mobileStyles = `
  @media only screen and (max-width: 600px) {
    .mobile-padding {
      padding-left: 20px !important;
      padding-right: 20px !important;
    }
    .mobile-header {
      padding: 20px !important;
    }
    .mobile-text {
      font-size: 16px !important;
      line-height: 1.6 !important;
    }
    .mobile-heading {
      font-size: 20px !important;
    }
    .mobile-small-heading {
      font-size: 16px !important;
    }
    .mobile-table td {
      display: block !important;
      width: 100% !important;
      padding: 3px 0 !important;
    }
    .mobile-box {
      padding: 15px !important;
      margin-bottom: 15px !important;
    }
  }
`;

interface BaseEmailProps {
  previewText: string;
  children: React.ReactNode;
}

export const BaseEmail = ({ previewText, children }: BaseEmailProps) => (
  <Html lang="de">
    <Head>
      <style>{mobileStyles}</style>
    </Head>
    <Preview>{previewText}</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header} className="mobile-header">
          <Heading style={headerTitle} className="mobile-heading">Fahrerexpress-Agentur</Heading>
          <Text style={headerSubtitle} className="mobile-text">LKW CE Fahrer & Baumaschinenführer</Text>
        </Section>

        {/* Content */}
        <Section style={content} className="mobile-padding">
          {children}
        </Section>

        {/* Footer */}
        <Section style={footer} className="mobile-padding">
          <Heading style={footerTitle} className="mobile-small-heading">Fahrerexpress-Agentur</Heading>
          <Text style={footerText} className="mobile-text">
            📧 info@kraftfahrer-mieten.com<br />
            📱 01577 1442285
          </Text>
          <Text style={footerSubtext} className="mobile-text">
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

// Reusable box styles with mobile support
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

// Helper to add mobile classes to box sections
export const getBoxProps = (style: any) => ({
  style,
  className: 'mobile-box',
});

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

// Helper to add mobile classes to text elements
export const getTextProps = (style: any, type: 'heading' | 'small-heading' | 'text' = 'text') => ({
  style,
  className: type === 'heading' ? 'mobile-heading' : type === 'small-heading' ? 'mobile-small-heading' : 'mobile-text',
});

export default BaseEmail;
