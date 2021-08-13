import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { QuoteService } from '../quote.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxUiLoaderService } from 'ngx-ui-loader';
// declare var jQuery: any;

// function addQuestion() {
//   var html = '';
//   html =  '<div fxLayout="row" fxLayoutAlign="start center" >' +
//   '<mat-form-field class="example-full-width w-100 mt-2 cus-padding" appearance="outline">' +
//     '<mat-label>Questions</mat-label>' +
//     '<input matInput placeholder="questions" formControlName="questions" name="questions" autocomplete="off" class="width-80"/>' +
//     '<mat-error *ngIf="addFormsForm.get(\'questions\')?.hasError(\'required\')"> Questions is Required! </mat-error>' +
//   '</mat-form-field>' +
//   '<button type="button" (click)="addQuestion()" class="btn btn-light cus-button">' +
//     '<mat-icon>add_circle_outline</mat-icon>' +
//   '</button>'+
// '</div>'+
// '<div fxLayout="row" fxLayoutAlign="start center">' +
//   '<mat-label class="custom-label">Answers :</mat-label>'+
//   '<mat-form-field appearance="outline" class="w-90 mt-2">'+
//     '<mat-select formControlName="answer">'+
//       '<mat-option *ngFor="let answer of answers" value={{ answer }}>'+
//         '{{ answer }}'+
//       '</mat-option>'+
//     '</mat-select>'+
//     '<mat-error *ngIf="addFormsForm.get(\'answer\')?.hasError(\'required\')"> Answers is Required! </mat-error>'+
//   '</mat-form-field>'+
// '</div>';
//   (function ($) {
//     $(".add-quesitons").after(html);
//   })(jQuery);
// }

export interface FormsData {
  id: string;
  name: string;
  questions: string;
  answers: string;
  createdAt: string;
  formowner: string;
  status: string;
}

@Component({
  selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.scss'],
})
export class FormsComponent implements OnInit, AfterViewInit {
  isLoading = false;
  formsData: any;
  isAdmin: boolean;
  colDef: string[] = ['name', 'formowner', 'status', 'createdAt', 'actions'];
  dataSource: MatTableDataSource<FormsData>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  selectedFormID: any;
  addFormsForm: FormGroup;
  editFormsForm: FormGroup;
  answers: string[] = ['Button', 'Input'];
  containers: number[] = [1];
  acontainers: number[] = [];
  icontainers: number[] = [];
  btncontainers: number[] = [1];
  inputcontainers: number[] = [1];

  constructor(
    private quoteService: QuoteService,
    private modalService: NgbModal,
    private ngxLoader: NgxUiLoaderService,
    private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.ngxLoader.start();
    this.addFormsForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      questions: ['', [Validators.required]],
      answers: ['', [Validators.required]],
    });
    if (localStorage.getItem('userStatus') === 'ADMIN') {
      this.isAdmin = true;
    } else {
      this.isAdmin = false;
    }
    // this.containers.push(1);
  }

  ngAfterViewInit() {
    // this.getForms();
    this.formsData = [
      {
        id: 1,
        name: 'testname1',
        status: 'on_reg',
        formowner: 'formowner',
        createdAt: '2021-08-12',
      },
      {
        id: 2,
        name: 'testname2',
        status: 'active',
        formowner: 'formowner',
        createdAt: '2021-08-12',
      },
      {
        id: 3,
        name: 'testname3',
        status: 'inactive',
        formowner: 'formowner',
        createdAt: '2021-08-12',
      },
    ];

    this.filterFormsData(this.formsData);
    this.ngxLoader.stop();
  }

  newForm(content: any) {
    this.modalService.open(content, { size: 'md' });
  }

  getForms() {
    this.ngxLoader.start();
    this.quoteService
      .getAllForms()
      .pipe(
        finalize(() => {
          this.ngxLoader.stop();
        })
      )
      .subscribe(
        (res: any) => {
          if (res.status === 200 && res.body.data) {
            this.formsData = res.body.data;
            this.filterFormsData(this.formsData);
          }

          this.ngxLoader.stop();
        },
        (error) => {
          this.ngxLoader.stop();
        }
      );
  }

  addForm(e: any) {
    this.ngxLoader.start();
    // if (this.addFormsForm.valid) {
    //   const data2Send = {
    //     name: this.addFormsForm.value.name,
    //     questions: this.addFormsForm.value.questions,
    //     answers: this.addFormsForm.value.answers,
    //   };
    //   this.quoteService
    //     .addForm(data2Send)
    //     .pipe(
    //       finalize(() => {
    //         this.ngxLoader.stop();
    //       })
    //     )
    //     .subscribe(
    //       (res: any) => {
    //         if (res.status === 200) {
    //           this._snackBar.open(`Program has been added!`, '', {
    //             duration: 3000,
    //             verticalPosition: 'top',
    //             panelClass: ['blue-snackbar'],
    //           });
    //           this.modalService.dismissAll();
    //           this.addFormsForm.reset();
    //         }
    //         this.ngxLoader.stop();
    //       },
    //       (error) => {
    //         this.ngxLoader.stop();
    //       }
    //     );
    // }
    this.modalService.dismissAll();
    this.addFormsForm.reset();
    this.ngxLoader.stop();
  }

  deleteForm(id: string) {
    this.ngxLoader.start();
    this.quoteService
      .deleteForm(id)
      .pipe(
        finalize(() => {
          this.ngxLoader.stop();
        })
      )
      .subscribe(
        (res: any) => {
          if (res.status === 200 && res.body) {
            this._snackBar.open(`Form deleted!`, '', {
              duration: 3000,
              verticalPosition: 'top',
              panelClass: ['blue-snackbar'],
            });
          }
          this.ngxLoader.stop();
        },
        (error) => {
          this.ngxLoader.stop();
        }
      );
  }

  editForm(content: any, data: any) {
    this.selectedFormID = data.id;
    this.editFormsForm.patchValue({
      name: data.name ? data.name : '',
      questions: data.questions ? data.questions : null,
      answers: data.answers ? data.answers : null,
    });
    this.modalService.open(content, { size: 'md', backdropClass: 'light-blue-backdrop' });
  }

  addQuestion() {
    this.addFormsForm.reset();
    this.containers.push(this.containers.length);
  }

  onAnswerChange(e:any) {
    let selectedAnswer = e.value;
    this.addFormsForm.reset();
    if(selectedAnswer == 'Button'){
      this.acontainers.push(1);
      if(this.icontainers.length > 0){
        this.icontainers.splice(0, 1);
      }
    } else {
      this.icontainers.push(1);
      if(this.acontainers.length > 0) {
        this.acontainers.splice(0, 1);
      }
    }
  }

  addButton() {
    this.btncontainers.push(this.btncontainers.length);
  }

  addInput() {
    this.inputcontainers.push(this.inputcontainers.length);
  }

  patchForm(id: any) {
    if (this.editFormsForm.valid) {
      const data2Send = this.editFormsForm.value;
      this.quoteService
        .editForm(data2Send, id)
        .pipe(
          finalize(() => {
            this.ngxLoader.stop();
          })
        )
        .subscribe(
          (res: any) => {
            if (res.status === 200) {
              this._snackBar.open(`Employee details updated!`, '', {
                duration: 3000,
                verticalPosition: 'top',
                panelClass: ['blue-snackbar'],
              });
              this.getForms();
              this.modalService.dismissAll();
              this.editFormsForm.reset();
            }
            this.ngxLoader.stop();
          },
          (error) => {
            this.ngxLoader.stop();
          }
        );
    }
  }

  compareAnswer(st1: any, st2: any) {
    return st1 && st2 && st1 === st2;
  }

  filterFormsData(data: any) {
    if (data !== undefined) {
      let formTableData = data.map((form: any) => {
        return {
          id: form.id,
          name: form.name,
          questions: form.questions,
          answers: form.answers,
          formowner: form.formowner,
          status: form.status,
          createdAt: form.createdAt,
        };
      });
      this.dataSource = formTableData;
    }
  }
}
