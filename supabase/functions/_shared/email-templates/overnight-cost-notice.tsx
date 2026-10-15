import { Heading, Text, Section } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { boxStyles, textStyles, getBoxProps, getTextProps } from './base-email.tsx';
import { OVERNIGHT_COSTS, overnightParagraphs } from '../overnight-costs.ts';

export const OvernightCostNotice = ({ tarifKey, isFernfahrerTarif = false }: {
  tarifKey?: string;
  isFernfahrerTarif?: boolean;
}) => (
  <Section {...getBoxProps(boxStyles.infoBox)}>
    <Heading {...getTextProps(textStyles.heading3, 'small-heading')}>{OVERNIGHT_COSTS.title}</Heading>
    {overnightParagraphs(tarifKey, isFernfahrerTarif).map((paragraph) => (
      <Text key={paragraph} {...getTextProps(textStyles.paragraph)}>{paragraph}</Text>
    ))}
  </Section>
);