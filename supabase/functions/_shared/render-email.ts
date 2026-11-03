/**
 * UTF-8-sichere E-Mail-Erzeugung.
 * renderAsync aus @react-email 0.0.22 dekodiert Stream-Blöcke einzeln und kann dadurch
 * Umlaute an Blockgrenzen zerstören („��“). render() erzeugt dasselbe Dokument
 * (gleicher Doctype) synchron über renderToStaticMarkup ohne Blockgrenzen.
 */
import { render } from 'npm:@react-email/components@0.0.22';
import type * as React from 'npm:react@18.3.1';

export const renderAsync = async (element: React.ReactElement): Promise<string> => render(element);
