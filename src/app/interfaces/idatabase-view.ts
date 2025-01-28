import { Type } from '@angular/core';

export interface IDatabaseView {
  id: number;
  type_name: string;
  display_name: string;
  display_name_plural: string;
  description: string;
  icon: string;
}
