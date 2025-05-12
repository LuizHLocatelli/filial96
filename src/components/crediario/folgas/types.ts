
import { z } from "zod";

export interface Crediarista {
  id: string;
  nome: string;
  avatar?: string;
}

export interface Folga {
  id: string;
  data: Date;
  crediaristaId: string;
  motivo?: string;
}
