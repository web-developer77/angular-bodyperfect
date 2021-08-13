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

export interface Recommendations {
  type: string;
  description: string;
}

@Component({
  selector: 'app-recommendations',
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.scss'],
})
export class RecommendationsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['type', 'description', 'actions'];
  isLoading = false;
  recommendationData: any;
  dataSource: MatTableDataSource<Recommendations>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  recommendations: string[] = ['FOOD', 'RECIPE'];
  selectedRec = 'Food';
  addRecForm: FormGroup;

  constructor(
    private quoteService: QuoteService,
    private modalService: NgbModal,
    private ngxLoader: NgxUiLoaderService,
    private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.ngxLoader.start();
    this.addRecForm = this.formBuilder.group({
      type: ['', [Validators.required]],
      description: ['', [Validators.required]],
    });
  }

  ngAfterViewInit() {
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
    this.getRecommendations();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  newRecommendation(content: any) {
    this.modalService.open(content, { size: 'md' });
  }

  getRecommendations() {
    this.ngxLoader.start();
    this.quoteService
      .getAllRecommendations()
      .pipe(
        finalize(() => {
          this.ngxLoader.stop();
        })
      )
      .subscribe(
        (res: any) => {
          if (res.status === 200 && res.body.data) {
            this.recommendationData = res.body.data;
            this.filterRecommendationData(this.recommendationData);
          }

          this.ngxLoader.stop();
        },
        (error) => {
          this.ngxLoader.stop();
        }
      );
  }

  addRecommendation(e: any) {
    this.ngxLoader.start();
    if (this.addRecForm.valid) {
      const data2Send = this.addRecForm.value;
      this.quoteService
        .addRecommendation(data2Send)
        .pipe(
          finalize(() => {
            this.ngxLoader.stop();
          })
        )
        .subscribe(
          (res: any) => {
            if (res.status === 200) {
              this._snackBar.open(`Recommendation had been added!`, '', {
                duration: 3000,
                verticalPosition: 'top',
                panelClass: ['blue-snackbar'],
              });
              this.modalService.dismissAll();
              this.addRecForm.reset();
            }
            this.ngxLoader.stop();
          },
          (error) => {
            this.ngxLoader.stop();
          }
        );
    }
  }

  deleteRecommendation(id: string) {
    this.ngxLoader.start();
    this.quoteService
      .deleteRecommendation(id)
      .pipe(
        finalize(() => {
          this.ngxLoader.stop();
        })
      )
      .subscribe(
        (res: any) => {
          if (res.status === 200 && res.body) {
            this._snackBar.open(`Recommendation deleted!`, '', {
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

  filterRecommendationData(data: any) {
    if (data !== undefined) {
      let recommendationTableData = data.map((rec: any) => {
        return {
          type: rec.type,
          description: rec.description,
          id: rec.id,
        };
      });

      this.dataSource = recommendationTableData;

      this.ngxLoader.stop();
    }
  }
}
