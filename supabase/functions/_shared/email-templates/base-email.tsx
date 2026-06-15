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

// Technischer Typ-Shim: erlaubt native HTML-Tags (style, br, strong, ...) in JSX
// innerhalb der Edge-Function-Typprüfung. Keine Laufzeitwirkung.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Fahrerexpress Brand Colors (freigegebene Designrichtung)
export const colors = {
  // Akzent / CTA
  primary: '#bb2c29',
  primaryDark: '#8b2120',
  primaryLight: '#e63946',
  // Marken-Navy für Header/Footer
  navy: '#0d2340',
  navyDark: '#081a30',
  navyLight: '#1e3a5f',
  // Flächen
  background: '#f8fafc',     // hellgraue Fläche
  surface: '#ffffff',        // Karten
  foreground: '#0d2340',     // Standardtext dunkelblau
  border: '#e5e7eb',
  muted: '#6b7280',
  // Status (unverändert für bestehende Boxen)
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
      padding: 24px 20px !important;
    }
    .mobile-text {
      font-size: 16px !important;
      line-height: 1.6 !important;
    }
    .mobile-heading {
      font-size: 22px !important;
      line-height: 1.25 !important;
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
  children?: React.ReactNode;
  plainHeader?: boolean;
  headerSubtitleOverride?: string;
}

export const BaseEmail = ({ previewText, children, plainHeader, headerSubtitleOverride }: BaseEmailProps) => (
  <Html lang="de">
    <Head>
      <style>{mobileStyles}</style>
    </Head>
    <Preview>{previewText}</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header — Navy mit rotem Akzentbalken */}
        <Section style={plainHeader ? headerPlain : header} className="mobile-header">
          <Heading style={plainHeader ? headerTitlePlain : headerTitle} className="mobile-heading">
            Fahrerexpress-Agentur – Günter Killer
          </Heading>
          <Text style={plainHeader ? headerSubtitlePlain : headerSubtitle} className="mobile-text">
            {headerSubtitleOverride || 'Vermittlung selbstständiger Fahrer'}
          </Text>
        </Section>
        <Section style={accentBar}>{' '}</Section>

        {/* Content */}
        <Section style={content} className="mobile-padding">
          {children}
        </Section>

        {/* Footer — Navy, vollständige Anschrift */}
        <Section style={footer} className="mobile-padding">
          <Heading style={footerTitle} className="mobile-small-heading">Fahrerexpress-Agentur</Heading>
          <Text style={footerText} className="mobile-text">
            Inhaber: Günter Killer<br />
            Walther-von-Cronberg-Platz 12<br />
            60594 Frankfurt am Main
          </Text>
          <Text style={footerText} className="mobile-text">
            Telefon: 01577 1442285<br />
            E-Mail: info@kraftfahrer-mieten.com<br />
            Web: www.kraftfahrer-mieten.com
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
  backgroundColor: colors.navy,
  padding: '30px 40px',
  textAlign: 'left' as const,
};

const accentBar = {
  backgroundColor: colors.primary,
  height: '4px',
  lineHeight: '4px',
  fontSize: '0',
  padding: '0',
};

const headerTitle = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
  lineHeight: '1.2',
};

const headerSubtitle = {
  color: '#cbd5e1',
  fontSize: '14px',
  margin: '6px 0 0 0',
};

const headerPlain = {
  backgroundColor: '#ffffff',
  padding: '28px 40px 12px 40px',
  textAlign: 'left' as const,
  borderBottom: `1px solid ${colors.border}`,
};

const headerTitlePlain = {
  color: colors.navy,
  fontSize: '22px',
  fontWeight: 'bold',
  margin: '0',
  letterSpacing: '0.2px',
};

const headerSubtitlePlain = {
  color: '#6b7280',
  fontSize: '13px',
  margin: '6px 0 0 0',
  fontWeight: 'normal',
};

const content = {
  padding: '40px',
};

const footer = {
  backgroundColor: colors.navy,
  padding: '28px 40px',
  textAlign: 'left' as const,
  borderTop: `4px solid ${colors.primary}`,
};

const footerTitle = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
};

const footerText = {
  color: '#cbd5e1',
  fontSize: '13px',
  margin: '0 0 12px 0',
  lineHeight: '1.6',
};

const footerSubtext = {
  color: '#94a3b8',
  fontSize: '12px',
  margin: '0',
  lineHeight: '1.5',
};

// Reusable box styles with mobile support
const _boxStylesBase = {
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

// Public boxStyles inkl. technischer Aliase (info/success/warning/highlight)
// für bestehende Templates. Werte unverändert.
export const boxStyles = {
  ..._boxStylesBase,
  info: _boxStylesBase.infoBox,
  success: _boxStylesBase.successBox,
  warning: _boxStylesBase.warningBox,
  highlight: _boxStylesBase.highlightBox,
};

// Helper to add mobile classes to box sections
export const getBoxProps = (style: any) => ({
  style,
  className: 'mobile-box',
});

const _textStylesBase = {
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

// Public textStyles inkl. technischer Aliase (h1/h2/h3) für bestehende Templates.
// Werte unverändert; h1 ist Alias auf heading2 (größtes vorhandenes Heading).
export const textStyles = {
  ..._textStylesBase,
  h1: _textStylesBase.heading2,
  h2: _textStylesBase.heading2,
  h3: _textStylesBase.heading3,
};

// Helper to add mobile classes to text elements
export const getTextProps = (style: any, type: 'heading' | 'small-heading' | 'text' = 'text') => ({
  style,
  className: type === 'heading' ? 'mobile-heading' : type === 'small-heading' ? 'mobile-small-heading' : 'mobile-text',
});

export default BaseEmail;
