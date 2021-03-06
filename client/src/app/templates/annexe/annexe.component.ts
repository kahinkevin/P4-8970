import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { MatTableModule } from '@angular/material/table';
import { DataSource } from '@angular/cdk/table';
import {ScrollDispatchModule} from '@angular/cdk/scrolling';
import { BaseFormComponent } from '../base-form.component';
import { AbstractControl, FormGroup } from '@angular/forms';

export interface IAnnexRow {
  id: number;
  date: Date;
  description: string;
  ref: string;
  perdiem: number;
  nbKm: number;
  pers: boolean;
  fraisKm: number;
  chambreST: number;
  fraisRecMoins: number;
  fraisRecPlus: number;
  fourniture: number;
  inscription: number;
  qcHqc: string;
  montant: number; /*
  devise = 'CAN';
  deviseCAN = 0;*/
  fournitureMateriel: boolean;
  plusDeCinq: boolean;

}

export class AnnexRowData implements IAnnexRow {
  id = 0;
  date: Date = null;
  description = '';
  ref = '';
  perdiem = 0;
  nbKm = 0;
  pers = false;
  fraisKm = 0;
  chambreST = 0;
  fraisRecMoins = 0;
  fraisRecPlus = 0;
  fourniture = 0;
  inscription = 0;
  qcHqc = 'QC';
  montant = 0; /*
  devise = 'CAN';
  deviseCAN = 0;*/
  fournitureMateriel = false;
  plusDeCinq = false;

  constructor() {}

  // THIS WAS PHYSICALLY PAINFUL TO WRITE
  public add(other: IAnnexRow) {
    this.perdiem += other.perdiem;
    this.fraisKm += other.fraisKm;
    this.chambreST += other.chambreST;
    this.fraisRecMoins += other.fraisRecMoins;
    this.fraisRecPlus += other.fraisRecPlus;
    this.fourniture += other.fourniture;
    this.inscription += other.inscription;
  }
  public reset() {
    this.perdiem = 0;
    this.fraisKm = 0;
    this.chambreST = 0;
    this.fraisRecMoins = 0;
    this.fraisRecPlus = 0;
    this.fourniture = 0;
    this.inscription = 0;
  }
  public getTotal() {
    return this.perdiem
    + this.fraisKm
    + this.chambreST
    + this.fraisRecMoins
    + this.fraisRecPlus
    + this.fourniture
    + this.inscription;
  }
}

@Component({
  selector: 'app-annexe',
  templateUrl: './annexe.component.html',
  styleUrls: ['./annexe.component.css']
})
export class AnnexeComponent {

  annexe = {
    tableau: [],
    accHQC: '',
    accQC: '',
  };

  formcontrol: AbstractControl = new FormGroup({});
  constructor() { }

  ventTotalQC: AnnexRowData = new AnnexRowData();
  ventTotalHQC: AnnexRowData = new AnnexRowData();
  ventTotalHCA = { montant: 0, fourniture: 0, personne: 0};

  totalDuRapport = 0;
  ventilation: IAnnexRow[];
  displayedColumns: string[] = ['date', 'description', 'ref', 'perdiem', 'nbKm', 'pers',
  'fraisKm', 'chambreST', 'fraisRecMoins', 'fraisRecPlus', 'fourniture', 'inscription',
  'qcHqc', 'montant', /*'devise', 'deviseCAN',*/ 'fournitureMateriel', 'plusDeCinq', 'action'];
  precisions = false;

  dSventilation = new MatTableDataSource(this.ventilation);
  setAnnexe(annex: {tableau: IAnnexRow[], accHQC: string, accQC: string }) {
    this.ventilation = annex.tableau;
    this.dSventilation = new MatTableDataSource(this.ventilation);
    this.updateTotal();
  }

  updateTotal() {
    this.ventTotalQC.reset();
    this.ventTotalHQC.reset();
    this.ventTotalHCA.montant = 0;
    this.ventTotalHCA.fourniture = 0;
    this.ventTotalHCA.personne = 0;

    this.ventilation.forEach(element => {
      // Row math
      element.fraisKm = Math.round((element.pers ? 0.54 : 0.43) * element.nbKm * 100) / 100;
      // Split QC/HQC
      if (element.qcHqc === 'QC') { this.ventTotalQC.add(element); }
      if (element.qcHqc === 'HQC') { this.ventTotalHQC.add(element); }
      // Hors-Canada
      if (element.fournitureMateriel) {
        if (!element.plusDeCinq) {
          this.ventTotalHCA.fourniture += element.montant;
        }
          // else... IGNORED...?
      } else if (element.plusDeCinq) {
        this.ventTotalHCA.personne += element.montant;
      } else {
        this.ventTotalHCA.montant += element.montant;
      }
    });
    this.totalDuRapport = this.ventTotalQC.getTotal() + this.ventTotalHQC.getTotal()
    + this.ventTotalHCA.fourniture + this.ventTotalHCA.montant + this.ventTotalHCA.personne;
    this.formcontrol.updateValueAndValidity();
  }

  onCreate() {
    const row = new AnnexRowData();
    row.id = BaseFormComponent.getHighestId(this.ventilation) + 1;
    this.ventilation.push(row);
    this.dSventilation._updateChangeSubscription();
    this.updateTotal();
  }

  onDelete(value) {
    for (let i = 0; i < this.ventilation.length; i++) {
      if (this.ventilation[i].id === value) {
          this.ventilation.splice(i, 1);
      }
    }
    this.dSventilation._updateChangeSubscription();
    this.updateTotal();
  }

  openDialog(){
    if(this.precisions ==true){
      this.precisions=false;}
    else{this.precisions=true}
    }
}
