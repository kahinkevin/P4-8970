import { Component } from '@angular/core';
import {MatFormFieldModule, MatGridListModule, MatTableDataSource} from '@angular/material';
import { FormsModule, ReactiveFormsModule, FormControl, Validators, FormGroup} from '@angular/forms';
import { checkAndUpdateBinding } from '@angular/core/src/view/util';
import { Signature, ISignature } from '../fields';
import { BaseFormComponent } from '../base-form.component';

export interface IAideFinanciere {

  // DEMANDEUR
  demandeur: {
    id: string;
    assigneA: string;

    nom: string;
    telephone: string;
    centre: string;
    admin: string;
  };

  // BENEFICIAIRE
  beneficiaire: {
    id: string;
    assigneA: string;

    nom: string;
    prenom: string;
    mat_etudiant: string;
    mat_enseignant: string;
  };


  // CYCLE DE L'ETUDIANT
  cycle: {
    id: string;
    assigneA: string;

    bac: boolean;
    bacec: boolean;
    mai: boolean;
    maiec: boolean;
    doc: boolean;
    docec: boolean;
  };


  // DETAILS
  details: {
    id: string;
    assigneA: string;

    date_debut: Date;
    date_fin: Date;
    statutVersement: string;
    num_ref: string;
    montant: number;
    subventionnaire: string;
  };


  // Ventilation
  ventilation: {
    id: string;
    assigneA: string;

    tableau: IVentilationAF[];
  };

  remarques: {
    id: string;
    assigneA: string;

    value: string;
  };

  signatures: ISignature[];

}
export interface IVentilationAF {
  id: number;
  ubr: string;
  compte: string;
  unite: string;
  percent: number;
  montant: number;
}

@Component({
  selector: 'app-af-form',
  templateUrl: './app.af-form.html',
  styleUrls: ['./app.af-form.css']
})
export class AFFormComponent extends BaseFormComponent implements IAideFinanciere {

  // DEMANDEUR
  demandeur = {
    id: 'demandeur',
    assigneA: null,
    nom : '',
    telephone : '',
    centre : '',
    admin : '',
  };

  // BENEFICIAIRE
  beneficiaire = {
    id: 'beneficiaire',
    assigneA: null,
    nom : '',
    prenom : '',
    mat_etudiant : '',
    mat_enseignant : '',
  };

  // CYCLE DE L'ETUDIANT
  cycle = {
    id: 'cycle',
    assigneA: null,

    bac: false,
    bacec: false,
    mai: false,
    maiec: false,
    doc: false,
    docec: false,
  };

  // DETAILS
  details = {
    id: 'details',
    assigneA: null,

    date_debut: undefined,
    date_fin: undefined,
    statutVersement: '',
    num_ref: '',
    montant: 0,
    subventionnaire: '',
  };
  ventilation = {
    id: 'ventilation',
    assigneA: null,

    tableau: [
      {id: 0, ubr: '', compte: '', unite: '', percent: 0, montant: 0, },
      {id: 1, ubr: '', compte: '', unite: '', percent: 0, montant: 0, },
      {id: 2, ubr: '', compte: '', unite: '', percent: 0, montant: 0, },
    ],
  };
  remarques = {
    id: 'remarques',
    assigneA: null,

    value: '',
  };
  signatures = [
    new Signature('sig-boursier', 'SIGNATURE DU BOURSIER', null, '', false, false, false),
    new Signature('sig-titulaire', 'SIGNATURE DU (DES) TITULAIRES(S) DE SUBVENTION', null, '', false, false, false),
    new Signature('sig-autorise', 'SIGNATURE(S) AUTORISÉE(S)', null, '', false, false, false),
    new Signature('sig-finances', 'SERVICE DES FINANCES', null, '', false, false, false),
  ];
  ventilationTotal = 0;

  dSventilation = new MatTableDataSource(this.ventilation.tableau);
  displayedColumns: string[] = ['ubr', 'compte', 'unite', 'percent', 'montant', 'action'];

  matriculesValide = false;

  onChangeStatus(value) {
    this.details.statutVersement = value;
  }
  updateTotal() {
    this.ventilationTotal = 0;
    this.ventilation.tableau.forEach(element => {
      this.ventilationTotal += element.montant;
    });
  }
  onCreate() {
    const id = BaseFormComponent.getHighestId(this.ventilation.tableau) + 1;
    this.ventilation.tableau.push(
      {id: id, ubr: '', compte: '', unite: '', percent: 0, montant: 0, }
    );
    this.dSventilation._updateChangeSubscription();
    this.updateTotal();
  }
  onDelete(value) {
    const index: number = this.ventilation.tableau.findIndex((el: any) => el.id === value.id);
    if (index >= 0) {
      this.ventilation.tableau.splice(index, 1);
    }

    this.dSventilation._updateChangeSubscription();
    this.updateTotal();
  }
  testMatricule() {
    this.matriculesValide = this.beneficiaire.mat_enseignant.length === 0 && this.beneficiaire.mat_etudiant.length === 0;
  }

  // BASECLASS FUNCTIONS

  setSections() {
  this.sections = [
      this.demandeur, this.beneficiaire, this.cycle, this.details, this.ventilation, this.remarques
    ];
    this.dSventilation = new MatTableDataSource(this.ventilation.tableau);
  }

  initCalculs() {
    this.updateTotal();
    this.testMatricule();
    }

    fg_demandeur :FormGroup;
    fg_beneficiaire :FormGroup;
    fg_cycle :FormGroup;
    fg_details :FormGroup;
    fg_ventilation :FormGroup;
    fg_remarques :FormGroup;

    buildFormGroups() {
      this.fg_demandeur = new FormGroup({
        nom: new FormControl(this.demandeur.nom, Validators.required),
        telephone: new FormControl(this.demandeur.telephone, Validators.required),
        centre: new FormControl(this.demandeur.centre, Validators.required),
        admin: new FormControl(this.demandeur.admin, Validators.required),
      });
      this.fg_beneficiaire = new FormGroup({
        nom: new FormControl(this.beneficiaire.nom, Validators.required),
        prenom: new FormControl(this.beneficiaire.prenom, Validators.required),
        mat_enseignant: new FormControl(this.beneficiaire.mat_enseignant),
        mat_etudiant: new FormControl(this.beneficiaire.mat_etudiant),
      });
      this.fg_cycle = new FormGroup({
        bac: new FormControl(this.cycle.bac),
        bacec: new FormControl(this.cycle.bacec),
        mai: new FormControl(this.cycle.mai),
        maiec: new FormControl(this.cycle.maiec),
        doc: new FormControl(this.cycle.doc),
        docec: new FormControl(this.cycle.docec),
      }, (form) => { // At least one
         return form.value.bac || form.value.bacec
             || form.value.mai || form.value.maiec
             || form.value.doc || form.value.docec ? null : { invalid: true };
        });
      this.fg_details = new FormGroup({
        date_debut: new FormControl(this.details.date_debut),
        date_fin: new FormControl(this.details.date_fin),
        statutVersement: new FormControl(this.details.statutVersement, Validators.required),
        num_ref: new FormControl(this.details.num_ref),
        montant: new FormControl(this.details.montant, Validators.required),
        subventionnaire: new FormControl(this.details.subventionnaire, Validators.required),
      });
    }
    getFormValues() {
      Object.assign(this.demandeur, this.fg_demandeur.value);
      Object.assign(this.beneficiaire, this.fg_beneficiaire.value);
      Object.assign(this.cycle, this.fg_cycle.value);
      Object.assign(this.details, this.fg_details.value);
      //Object.assign(this.ventilation, this.fg_ventilation.value);
      //Object.assign(this.remarques, this.fg_remarques.value);
    }

}
