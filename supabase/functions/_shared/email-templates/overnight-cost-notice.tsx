import { Heading, Text, Section } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { boxStyles, textStyles, getBoxProps, getTextProps } from './base-email.tsx';
import { OVERNIGHT_COSTS, overnightParagraphs } from '../overnight-costs.ts';

/** Dezent hellrote Hervorhebung für Zusatzkosten-Positionen in Kunden-E-Mails. */
export const ZUSATZKOSTEN_BOX = { backgroundColor: '#fef2f2', borderLeftColor: '#f87171' } as const;
export const ZUSATZKOSTEN_HEADING = '#991b1b';

export const OvernightCostNotice = ({ tarifKey, isFernfahrerTarif = false, highlight = false, showMultiWeek = false }: {
  tarifKey?: string;
  isFernfahrerTarif?: boolean;
  highlight?: boolean;
  showMultiWeek?: boolean;
}) => (
  <Section {...getBoxProps(highlight ? { ...boxStyles.infoBox, ...ZUSATZKOSTEN_BOX } : boxStyles.infoBox)}>
    <Heading {...getTextProps(highlight ? { ...textStyles.heading3, color: ZUSATZKOSTEN_HEADING } : textStyles.heading3, 'small-heading')}>{OVERNIGHT_COSTS.title}</Heading>
    {overnightParagraphs(tarifKey, isFernfahrerTarif).map((paragraph) => (
      <Text key={paragraph} {...getTextProps(textStyles.paragraph)}>{paragraph}</Text>
    ))}
    {showMultiWeek && (
      <Text {...getTextProps(textStyles.paragraph)}><strong>{OVERNIGHT_COSTS.multiWeekTitle}:</strong> {OVERNIGHT_COSTS.multiWeek}</Text>
    )}
  </Section>
);
