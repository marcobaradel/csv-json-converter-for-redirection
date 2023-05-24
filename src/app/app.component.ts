import { Component, ViewChild, ElementRef } from '@angular/core';
import { Papa } from 'ngx-papaparse';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('namePrefixInput', { static: false }) namePrefixInput!: ElementRef;

  public constructor(
    private papa:Papa
  ){}

  title = 'csv-json-converter-for-redirection';
  jsonData: any[] = [];
  selectedRedirectCode: string = '301';
  namePrefix: string = '';
  complete = false;

  handleFileInput(event: Event) {
    const inputFile = event.target as HTMLInputElement;
    const inputLink = this.namePrefixInput.nativeElement as HTMLInputElement;
    if (inputFile && inputFile.files) {
      const files = inputFile.files;
      const link = inputLink.value;
      this.namePrefix = link;
      console.log(this.namePrefix);
      // Resto del codice per il caricamento del file e la conversione CSV in JSON
      if (files && files.length > 0) {
        const file = files[0]; // Prendi il primo file dalla lista
        const reader = new FileReader();
  
        reader.onload = (e: any) => {
          const csv = e.target.result;
          this.convertCsvToJson(csv);
        };
  
        reader.readAsText(file);
      }
    }
  }

  updateRedirectCode() {
    // Aggiorna il campo "redirect_code" all'interno dell'oggetto "metas"
    this.jsonData.forEach((item: any) => {
      item.metas.redirect_code = this.selectedRedirectCode;
    });
  }

  convertCsvToJson(csv: string) {
    this.papa.parse(csv, {
      delimiter: ';',
      complete: (result) => {
        this.jsonData = result.data.map((row: any) => {
          const match = row[0].endsWith('/') ? row[0].slice(0,-1) : row[0];
          return {
            redirect: {
              id: '',
              from: row[0],
              match: match.replace(this.namePrefix, '/'),
              to: row[1],
              status: '1',
              timestamp: '',
              type: "redirection"
            },
            metas: {
              ignore_trailing_slashes: "",
              ignore_parameters: "",
              ignore_case: "",
              pass_on_parameters: "",
              redirect_code: this.selectedRedirectCode,
              inclusion_exclusion_rules: "",
              redirect_options: "are_case",
              redirection_http_headers: "",
              rules_group1: {
                enabled: "0",
                login_info: ""
              },
              rules_group2: {
                enabled: "0",
                role: "",
                role_name: ""
              },
              rules_group3: {
                enabled: "0",
                referrer: "",
                referrer_value: ""
              },
              rules_group4: {
                enabled: "0",
                agent: "",
                agent_value: "",
                agent_regex: "0"
              },
              rules_group5: {
                enabled: "0",
                cookie: "",
                cookie_name: "",
                cookie_value: "",
                cookie_regex: "0"
              },
              rules_group6: {
                enabled: "0",
                ip: "",
                ip_value: ""
              },
              rules_group7: {
                enabled: "0",
                server: "",
                server_value: ""
              },
              rules_group8: {
                enabled: "0",
                language: "",
                language_value: ""
              }
            }
          };
        });
        
        const json = JSON.stringify(this.jsonData, null, 2);
        console.log(json);
        this.downloadJson(json, 'import-redirection.json'); // Effettua il download del JSON come file
      },
      error: (error) => {
        console.error('Errore durante la conversione da CSV a JSON:', error);
      }
    });
  }

  downloadJson(json: string, filename: string) {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  refreshPage() {
    location.reload();
  }
  
}
