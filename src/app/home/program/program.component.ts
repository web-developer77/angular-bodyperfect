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

export interface ProgramData {
  name: string;
  productId: string;
  questions: boolean;
  moneyback: boolean;
  recommendations: boolean;
  duration: string;
}

@Component({
  selector: 'app-program',
  templateUrl: './program.component.html',
  styleUrls: ['./program.component.scss'],
})
export class ProgramComponent implements OnInit, AfterViewInit {
  isLoading = false;
  programData: any;
  colDef: string[] = ['name', 'productId', 'questions', 'moneyback', 'recommendations', 'duration', 'actions'];
  dataSource: MatTableDataSource<ProgramData>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  addProgramForm: FormGroup;

  constructor(
    private quoteService: QuoteService,
    private modalService: NgbModal,
    private ngxLoader: NgxUiLoaderService,
    private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.ngxLoader.start();
    this.addProgramForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      productIds: ['', [Validators.required]],
      duration: ['', [Validators.required]],
      moneyback: [true],
      foodRecommendations: [true],
      question: [true],
    });
  }

  ngAfterViewInit() {
    this.getPrograms();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  newProgram(content: any) {
    this.modalService.open(content, { size: 'md' });
  }

  getPrograms() {
    this.ngxLoader.start();
    this.quoteService
      .getAllPrograms()
      .pipe(
        finalize(() => {
          this.ngxLoader.stop();
        })
      )
      .subscribe(
        (res: any) => {
          if (res.status === 200 && res.body.data) {
            this.programData = res.body.data;
            this.filterProgramData(this.programData);
          }

          this.ngxLoader.stop();
        },
        (error) => {
          this.ngxLoader.stop();
        }
      );
  }

  addProgram(e: any) {
    this.ngxLoader.start();
    if (this.addProgramForm.valid) {
      const productIdsArray = this.addProgramForm.value.productIds.split(',');
      const data2Send = {
        name: this.addProgramForm.value.name,
        productIds: productIdsArray,
        duration: this.addProgramForm.value.duration,
        foodRecommendations: this.addProgramForm.value.foodRecommendations,
        question: this.addProgramForm.value.question,
        moneyback: this.addProgramForm.value.moneyback,
      };
      this.quoteService
        .addProgram(data2Send)
        .pipe(
          finalize(() => {
            this.ngxLoader.stop();
          })
        )
        .subscribe(
          (res: any) => {
            if (res.status === 200) {
              this._snackBar.open(`Program has been added!`, '', {
                duration: 3000,
                verticalPosition: 'top',
                panelClass: ['blue-snackbar'],
              });
              this.modalService.dismissAll();
              this.addProgramForm.reset();
            }
            this.ngxLoader.stop();
          },
          (error) => {
            this.ngxLoader.stop();
          }
        );
    }
  }

  deleteProgram(id: string) {
    this.ngxLoader.start();
    this.quoteService
      .deleteProgram(id)
      .pipe(
        finalize(() => {
          this.ngxLoader.stop();
        })
      )
      .subscribe(
        (res: any) => {
          if (res.status === 200 && res.body) {
            this._snackBar.open(`Program deleted!`, '', {
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

  filterProgramData(data: any) {
    if (data !== undefined) {
      let programTableData = data.map((program: any) => {
        let tempProductIds = program.productIds.map((x: any) => x).join(',');
        return {
          id: program.id,
          name: program.name,
          productId: tempProductIds,
          questions: program.question,
          moneyback: program.moneyback,
          recommendations: program.foodRecommendations,
          duration: program.duration,
        };
      });
      this.dataSource = programTableData;
    }
  }
}
