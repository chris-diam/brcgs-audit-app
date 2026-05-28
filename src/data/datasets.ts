import type { Clause, DataMeta } from '../core/types'

// BRCGS Greek v34.7.44
import brcgs_el_s1 from './brcgs/el/s1.json'
import brcgs_el_s2 from './brcgs/el/s2.json'
import brcgs_el_s3 from './brcgs/el/s3.json'
import brcgs_el_s4 from './brcgs/el/s4.json'
import brcgs_el_s5 from './brcgs/el/s5.json'
import brcgs_el_s6 from './brcgs/el/s6.json'
import brcgs_el_s7 from './brcgs/el/s7.json'
import brcgs_el_s8 from './brcgs/el/s8.json'
import brcgs_el_s9 from './brcgs/el/s9.json'
import brcgs_el_meta from './brcgs/el/meta.json'

// BRCGS English v35.0.2
import brcgs_en_s1 from './brcgs/en/s1.json'
import brcgs_en_s2 from './brcgs/en/s2.json'
import brcgs_en_s3 from './brcgs/en/s3.json'
import brcgs_en_s4 from './brcgs/en/s4.json'
import brcgs_en_s5 from './brcgs/en/s5.json'
import brcgs_en_s6 from './brcgs/en/s6.json'
import brcgs_en_s7 from './brcgs/en/s7.json'
import brcgs_en_s8 from './brcgs/en/s8.json'
import brcgs_en_s9 from './brcgs/en/s9.json'
import brcgs_en_meta from './brcgs/en/meta.json'

// ISO 22000:2018 Greek v1
import iso_el_s1 from './iso22000/el/s1.json'
import iso_el_s2 from './iso22000/el/s2.json'
import iso_el_s3 from './iso22000/el/s3.json'
import iso_el_s4 from './iso22000/el/s4.json'
import iso_el_s5 from './iso22000/el/s5.json'
import iso_el_s6 from './iso22000/el/s6.json'
import iso_el_s7 from './iso22000/el/s7.json'
import iso_el_s8 from './iso22000/el/s8.json'
import iso_el_s9 from './iso22000/el/s9.json'
import iso_el_meta from './iso22000/el/meta.json'

export interface Dataset {
  id: DatasetKey
  label: string
  standard: 'brcgs' | 'iso22000'
  language: 'el' | 'en'
  clauses: Clause[]
  mainSections: string[]
  meta: DataMeta
}

function buildDataset(
  id: DatasetKey,
  label: string,
  standard: 'brcgs' | 'iso22000',
  language: 'el' | 'en',
  sections: unknown[][],
  meta: unknown,
): Dataset {
  const clauses = sections.flat() as Clause[]
  const mainSections = [...new Set(clauses.map(c => c.main_section))]
  return { id, label, standard, language, clauses, mainSections, meta: meta as DataMeta }
}

export type DatasetKey = 'brcgs_el' | 'brcgs_en' | 'iso22000_el'

export const DATASETS: Record<DatasetKey, Dataset> = {
  brcgs_el: buildDataset(
    'brcgs_el', 'BRCGS Food Safety Issue 9 — Ελληνικά', 'brcgs', 'el',
    [brcgs_el_s1, brcgs_el_s2, brcgs_el_s3, brcgs_el_s4, brcgs_el_s5,
     brcgs_el_s6, brcgs_el_s7, brcgs_el_s8, brcgs_el_s9],
    brcgs_el_meta,
  ),
  brcgs_en: buildDataset(
    'brcgs_en', 'BRCGS Food Safety Issue 9 — English', 'brcgs', 'en',
    [brcgs_en_s1, brcgs_en_s2, brcgs_en_s3, brcgs_en_s4, brcgs_en_s5,
     brcgs_en_s6, brcgs_en_s7, brcgs_en_s8, brcgs_en_s9],
    brcgs_en_meta,
  ),
  iso22000_el: buildDataset(
    'iso22000_el', 'ISO 22000:2018 — Ελληνικά', 'iso22000', 'el',
    [iso_el_s1, iso_el_s2, iso_el_s3, iso_el_s4, iso_el_s5,
     iso_el_s6, iso_el_s7, iso_el_s8, iso_el_s9],
    iso_el_meta,
  ),
}
