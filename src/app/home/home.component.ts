import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatDialog } from '@angular/material/dialog';
import * as dayjs from 'dayjs';
import { QuoteService } from './quote.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MatSnackBar } from '@angular/material/snack-bar';
import { da } from 'date-fns/locale';

export interface UserData {
  name: string;
  phone: string;
  customerId: string;
  supervisor: string;
  program: string;
  timeRemaining: number;
}

export interface Message {
  from: string;
  text: string;
  createdAt: string;
  chatId: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  quote: string | undefined;
  isAdmin: boolean;
  selectedCustomerName: string;
  isLoading = false;
  hidePaginator = false;
  customerData: any;
  supervisors: string[] = [];
  programs: string[] = [];
  selectedSup = 'one';
  selectedProgram = 'one';
  numberOfCustomers = 0;
  numberOfActiveCustomers = 0;
  numberOfInactiveCustomers = 0;
  numberOfCompletedCustomers = 0;
  activeUsers: any;
  completedCustomers: any;
  inactiveUsers: any;
  allUsers: any;
  selectedCustomer: any;
  currentUserMessages: any;
  selectedCustomerID: any;

  currentMoneyback: boolean = false;
  currentFoodQuestions: boolean = false;
  currentInsta: boolean = false;
  currentSleepQuestions: boolean = false;
  currentWeightQuestions: boolean = false;
  currentFood: boolean = false;
  currentSleepDiagram: boolean = false;

  currentActiveTab = 'all';

  displayedColumns: string[] = ['name', 'phone', 'customerId', 'supervisor', 'program', 'timeRemaining', 'actions'];
  messageDisplayedColumns: string[] = ['from', 'text', 'timestamp'];
  dataSource: MatTableDataSource<UserData>;
  messageDataSource: MatTableDataSource<Message>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatPaginator) paginatorMessages: MatPaginator;
  // @ViewChild('categoryPaginator') categoryPaginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  sendMessageForm: FormGroup;
  editCustomerForm: FormGroup;

  constructor(
    private quoteService: QuoteService,
    private modalService: NgbModal,
    private ngxLoader: NgxUiLoaderService,
    private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {}

  ngAfterViewInit() {
    this.getCustomers();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnInit() {
    this.ngxLoader.start();
    this.sendMessageForm = this.formBuilder.group({
      message: ['', [Validators.required]],
    });

    this.getPrograms();
    this.getSupervisors();

    this.editCustomerForm = this.formBuilder.group({
      email: [''],
      initialWeight: [0],
      phone: [''],
      supervisor: [null],
      activeProgram: [null],
    });

    if (localStorage.getItem('userStatus') === 'ADMIN') {
      this.isAdmin = true;
    } else {
      this.isAdmin = false;
    }
  }

  // openDialog() {
  //   const dialogRef = this.dialog.open(DialogContentExampleDialog);

  //   dialogRef.afterClosed().subscribe((result) => {
  //     console.log(`Dialog result: ${result}`);
  //   });
  // }

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
            res.body.data.map((program: any) => {
              this.programs.push(program);
            });
          }
          this.ngxLoader.stop();
        },
        (error) => {
          this.ngxLoader.stop();
        }
      );
  }

  userPreference(preferenceName: string) {
    let data2Send = {};
    switch (preferenceName) {
      case 'moneyback':
        data2Send['moneyback'] = this.currentMoneyback;
        break;

      case 'insta':
        data2Send['instagramFeed'] = this.currentInsta;
        break;

      case 'foodQuestions':
        data2Send['foodQuestions'] = this.currentFoodQuestions;
        break;
      case 'sleepQuestions':
        data2Send['sleepQuestions'] = this.currentSleepQuestions;
        break;

      case 'weightQuestions':
        data2Send['weightQuestions'] = this.currentWeightQuestions;
        break;

      case 'foodRecommendations':
        data2Send['foodRecommendations'] = this.currentFood;
        break;

      case 'diagram':
        data2Send['diagram'] = this.currentSleepDiagram;
        break;
    }

    /* API call to change the user preference */
    this.quoteService
      .editCustomer(data2Send, this.selectedCustomerID)
      .pipe(
        finalize(() => {
          this.ngxLoader.stop();
        })
      )
      .subscribe(
        (res: any) => {
          if (res.status === 200) {
            this._snackBar.open(`Customer preferences changed!`, '', {
              duration: 3000,
              verticalPosition: 'top',
              panelClass: ['blue-snackbar'],
            });
            this.getCustomers();
            this.modalService.dismissAll();
          }
          this.ngxLoader.stop();
        },
        (error) => {
          this.ngxLoader.stop();
        }
      );
  }

  getSupervisors() {
    this.ngxLoader.start();
    this.quoteService
      .getSupervisors()
      .pipe(
        finalize(() => {
          this.ngxLoader.stop();
        })
      )
      .subscribe(
        (res: any) => {
          if (res.status === 200 && res.body.data) {
            res.body.data.map((emp: any) => {
              this.supervisors.push(emp);
            });
          }
          this.ngxLoader.stop();
        },
        (error) => {
          this.ngxLoader.stop();
        }
      );
  }

  getCustomers() {
    this.isLoading = true;
    this.quoteService
      .getAllCustomers()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(
        (res: any) => {
          if (res.status === 200 && res.body.data) {
            this.customerData = res.body.data;
            this.numberOfCustomers = this.customerData.length;
            this.filterCustomerData(this.customerData);
          }

          this.ngxLoader.stop();
        },
        (error) => {
          this.isLoading = false;
        }
      );
  }

  currentActive(tabName: string) {
    switch (tabName) {
      case 'all':
        this.currentActiveTab = 'all';
        this.dataSource = new MatTableDataSource(this.allUsers);
        setTimeout(() => (this.dataSource.paginator = this.paginator));
        this.hidePaginator = false;
        break;

      case 'active':
        this.currentActiveTab = 'active';
        this.dataSource = new MatTableDataSource(this.activeUsers);
        setTimeout(() => (this.dataSource.paginator = this.paginator));
        break;

      case 'inactive':
        this.currentActiveTab = 'inactive';
        this.dataSource = new MatTableDataSource(this.inactiveUsers);
        setTimeout(() => (this.dataSource.paginator = this.paginator));
        break;

      case 'completed':
        this.currentActiveTab = 'completed';
        this.dataSource = new MatTableDataSource(this.completedCustomers);
        setTimeout(() => (this.dataSource.paginator = this.paginator));
        break;
    }
  }

  viewCustomerDetails(content: any, customerId: string) {
    this.selectedCustomerID = customerId;

    let selectedCustomerTemp = this.customerData.map((customer: any) => {
      if (customer.id === customerId) {
        return customer;
      }
    });

    let selectedCustomerTemp1 = selectedCustomerTemp.filter((user: any) => {
      return user !== undefined;
    });

    this.selectedCustomer = selectedCustomerTemp1[0];

    if (this.selectedCustomer.length !== 0) {
      this.currentMoneyback = this.selectedCustomer.moneyback;
      this.currentInsta = this.selectedCustomer.instagramFeed;
      this.currentFoodQuestions = this.selectedCustomer.foodQuestions;
      this.currentSleepQuestions = this.selectedCustomer.sleepQuestions;
      this.currentWeightQuestions = this.selectedCustomer.weightQuestions;
      this.currentFood = this.selectedCustomer.foodRecommendations;
      this.currentSleepDiagram = this.selectedCustomer.diagram;
    }

    this.modalService.open(content, { size: 'xl' });
  }

  editProfile(content: any, data: any) {
    this.selectedCustomerID = data.id;
    this.editCustomerForm.patchValue({
      email: data.email ? data.email : null,
      initialWeight: data.initialWeight ? data.initialWeight : null,
      phone: data.phone ? data.phone : null,
      supervisor: data.supervisor?.id ? data.supervisor.id : null,
      activeProgram: data.activeProgram?.id ? data.activeProgram.id : null,
    });
    this.modalService.open(content, { size: 'md', backdropClass: 'light-blue-backdrop' });
  }

  compareSupervisor(sp1: any, sp2: any) {
    return sp1 && sp2 && sp1.id === sp2;
  }

  compareProgram(p1: any, p2: any) {
    return p1 && p2 && p1.id === p2;
  }

  sendMessage(content: any, chatId: any) {
    this.fetchMessages(chatId);
    this.modalService.open(content, { size: 'lg', backdropClass: 'light-blue-backdrop' });
  }

  sendTelegramMessage(e: any, id: any) {
    if (this.sendMessageForm.valid) {
      const data2Send = this.sendMessageForm.value;
      this.quoteService
        .sendTelegramMessage(data2Send, id)
        .pipe(
          finalize(() => {
            this.ngxLoader.stop();
          })
        )
        .subscribe(
          (res: any) => {
            if (res.status === 200) {
              this._snackBar.open(`Message sent!`, '', {
                duration: 3000,
                verticalPosition: 'top',
                panelClass: ['blue-snackbar'],
              });
              this.fetchMessages(this.selectedCustomer.telegramChatId);
              this.sendMessageForm.reset();
            }
            this.ngxLoader.stop();
          },
          (error) => {
            this.ngxLoader.stop();
          }
        );
    }
  }

  deleteCustomer(content: any, data: any) {
    this.selectedCustomerID = data.id;
    this.selectedCustomerName = data.fullName !== null ? data.fullName : data.telegramName;
    this.modalService.open(content, { size: 'md', backdropClass: 'light-blue-backdrop' });
  }

  patchCustomer(id: string) {
    this.ngxLoader.start();
    this.quoteService
      .deleteCustomer(id)
      .pipe(
        finalize(() => {
          this.ngxLoader.stop();
        })
      )
      .subscribe(
        (res: any) => {
          if (res.status === 200 && res.body) {
            this._snackBar.open(`Customer Deleted Successfully!`, '', {
              duration: 3000,
              verticalPosition: 'top',
              panelClass: ['blue-snackbar'],
            });
          }

          if (res === 'e') {
            this.modalService.dismissAll();
            this._snackBar.open(`Error in deleting the customer`, '', {
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

  editCustomer(customerID: any) {
    if (this.editCustomerForm.valid) {
      const data2Send = this.editCustomerForm.value;
      this.quoteService
        .editCustomer(data2Send, customerID)
        .pipe(
          finalize(() => {
            this.ngxLoader.stop();
          })
        )
        .subscribe(
          (res: any) => {
            if (res.status === 200) {
              this._snackBar.open(`Customer details changed!`, '', {
                duration: 3000,
                verticalPosition: 'top',
                panelClass: ['blue-snackbar'],
              });
              this.getCustomers();
              this.modalService.dismissAll();
              this.editCustomerForm.reset();
            }
            this.ngxLoader.stop();
          },
          (error) => {
            this.ngxLoader.stop();
          }
        );
    }
  }

  fetchMessages(cID: any) {
    this.quoteService
      .getMessages(cID)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(
        (res: any) => {
          if (res.status === 200 && res.body) {
            this.filterMessages(res.body.data);
          }

          this.ngxLoader.stop();
        },
        (error) => {
          this.isLoading = false;
        }
      );
  }

  filterMessages(data: any) {
    if (data !== undefined) {
      this.currentUserMessages = data.map((message: any) => {
        return {
          from: message.from,
          text: message.text,
          createdAt: message.createdAt,
          chatId: message.telegramChatId,
        };
      });

      // this.messageDataSource = this.currentUserMessages;
      this.messageDataSource = new MatTableDataSource(this.currentUserMessages);
      setTimeout(() => (this.messageDataSource.paginator = this.paginatorMessages));
    }
  }

  filterCustomerData(data: any) {
    if (data !== undefined) {
      this.allUsers = data.map((user: any) => {
        return {
          name: user.fullName,
          timeRemaining: user?.programRegistrationTimestamp
            ? Math.max(
                dayjs(user?.programRegistrationTimestamp).diff(dayjs(), 'days') + Number(user?.activeProgram?.duration),
                0
              ) || 'N/A'
            : 'N/A',
          ...user,
        };
      });

      let activeUserTemp = this.allUsers.map((user: any) => {
        if (user.activeProgram !== null) {
          return user;
        }
      });
      this.activeUsers = activeUserTemp.filter((user: any) => {
        return user !== undefined;
      });

      let completedCustomerTemp = this.allUsers.map((user: any) => {
        if (user.activeProgram !== null && user.programHistory.length) {
          return user;
        }
      });

      this.completedCustomers = completedCustomerTemp.filter((user: any) => {
        return user !== undefined;
      });
      this.numberOfCompletedCustomers = this.completedCustomers.length;
      this.numberOfActiveCustomers = this.activeUsers.length;
      let inactiveUsersTemp = this.allUsers.map((user: any) => {
        if (user.activeProgram === null) {
          return user;
        }
      });
      this.inactiveUsers = inactiveUsersTemp.filter((user: any) => {
        return user !== undefined;

        // if (user !== undefined) {
        //   return {
        //     ...user,
        //     phone: user.telegramChatId,
        //     timeRemaining: user?.programRegistrationTimestamp
        //       ? Math.max(
        //         dayjs(user?.programRegistrationTimestamp).diff(dayjs(), 'days') + Number(user?.activeProgram?.duration),
        //         0
        //       ) || 'N/A'
        //       : 'N/A',
        //   }
        // }
      });
      this.numberOfInactiveCustomers = this.inactiveUsers.length;

      this.dataSource = new MatTableDataSource(this.allUsers);
      setTimeout(() => (this.dataSource.paginator = this.paginator));
    }
  }
}

// @Component({
//   selector: 'dialog-content-example-dialog',
//   templateUrl: 'dialog-content-example-dialog.html',
// })
// export class DialogContentExampleDialog {}
