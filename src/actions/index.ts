import { auth } from './auth';
import { bienestar } from './bienestar';
import { crecimiento } from './crecimiento';
import { diario } from './diario';
import { estudio } from './estudio';
import { finanzas } from './finanzas';
import { personas } from './personas';
import { registro } from './registro';
import { responsabilidades } from './responsabilidades';

export const server = {
  auth,
  registro,
  diario,
  bienestar,
  estudio,
  finanzas,
  responsabilidades,
  personas,
  crecimiento,
};
