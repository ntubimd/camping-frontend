import { Component, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';

import { Rental } from '@models/rental/rental';

import { BorrowStatus } from '@enums/borrow-status.enum';
import { Color } from '@enums/color.enum';

import { RentalService } from '@services/api/rental.service';
import { SnakeBarService } from '@services/ui/snake-bar.service';

import { BorrowActionDialogComponent } from '@pages/borrow/borrow-action-dialog/borrow-action-dialog.component';
import { BorrowCommentDialogComponent } from '@pages/borrow/borrow-comment-dialog/borrow-comment-dialog.component';

import { rental } from '../../../fixtures/rental.fixture';

class StatusButton {
  text: string;
  color: Color;
  disable: boolean;

  constructor(text: string, color: Color, disable: boolean = false) {
    this.text = text;
    this.color = color;
    this.disable = disable;
  }
}

@Component({
  selector: 'app-borrow-list',
  templateUrl: './borrow-list.component.html',
  styleUrls: ['./borrow-list.component.scss'],
})
export class BorrowListComponent implements OnInit {
  isRental = false;
  rentals: Rental[] = [];

  constructor(
    private rentalService: RentalService,
    private snakeBarService: SnakeBarService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.updateRentals();
  }

  getBorrows(): void {
    this.rentalService.getBorrows().subscribe(
      (res) => {
        if (!res.result) {
          this.snakeBarService.open(res.message);
        }

        this.rentals = res.data;
        this.fakeRentals();
      },
      (err) => {
        this.snakeBarService.open(err.error.message);
      }
    );
  }

  getRentals(): void {
    this.rentalService.getRentals().subscribe(
      (res) => {
        if (!res.result) {
          this.snakeBarService.open(res.message);
        }

        this.rentals = res.data;
        this.fakeRentals();
      },
      (err) => {
        this.snakeBarService.open(err.error.message);
      }
    );
  }

  fakeRentals() {
    for (const x of Array(10).keys()) {
      const temp = { ...rental };
      temp.status = x;
      this.rentals.push(temp);
    }
  }

  updateRentals(): void {
    if (this.isRental) {
      this.getRentals();
    } else {
      this.getBorrows();
    }
  }

  getStatusText(status: BorrowStatus): string {
    switch (status) {
      case BorrowStatus.notAgree:
        return '未同意';
      case BorrowStatus.notPay:
        return '未付款';
      case BorrowStatus.alreadyCancel:
        return '已取消';
      case BorrowStatus.notPlace:
        return '未寄放';
      case BorrowStatus.notPickUp:
        return '未領取';
      case BorrowStatus.alreadyTerminate:
        return '已終止';
      case BorrowStatus.notReturn:
        return '未歸還';
      case BorrowStatus.notCompensate:
        return '未賠償';
      case BorrowStatus.notRetrieve:
        return '未取回';
      case BorrowStatus.notComment:
        return '未評價';
      case BorrowStatus.alreadyComment:
        return '已評價';
      default:
        return '未知';
    }
  }

  getStatusColor(status: BorrowStatus): string {
    switch (status) {
      case BorrowStatus.notAgree:
      case BorrowStatus.notPay:
      case BorrowStatus.notCompensate:
        return Color.primary5;
      case BorrowStatus.notPlace:
      case BorrowStatus.notPickUp:
        return Color.primary1;
      case BorrowStatus.notReturn:
      case BorrowStatus.notRetrieve:
        return Color.primary2;
      case BorrowStatus.notComment:
        return Color.primary4;
      default:
        return Color.lightgray;
    }
  }

  getStatusButton(status: BorrowStatus): StatusButton[] {
    return this.isRental
      ? this.getRentalButton(status)
      : this.getBorrowButton(status);
  }

  getBorrowButton(status: BorrowStatus): StatusButton[] {
    switch (status) {
      case BorrowStatus.notAgree:
        return [new StatusButton('取消交易', Color.red)];
      case BorrowStatus.notPay:
        return [
          new StatusButton('取消交易', Color.red),
          new StatusButton('付款', Color.primary2),
        ];
      case BorrowStatus.notPlace:
        return [new StatusButton('取消交易', Color.red)];
      case BorrowStatus.notPickUp:
        return [new StatusButton('扣除手續費終止交易', Color.red)];
      case BorrowStatus.notCompensate:
        return [new StatusButton('付款', Color.primary2)];
      case BorrowStatus.notComment:
        return [new StatusButton('評價租方', Color.primary4)];
      default:
        return [new StatusButton('無可執行動作', Color.lightgray, true)];
    }
  }

  getRentalButton(status: BorrowStatus): StatusButton[] {
    switch (status) {
      case BorrowStatus.notAgree:
        return [
          new StatusButton('拒絕', Color.red),
          new StatusButton('同意', Color.primary2),
        ];
      case BorrowStatus.notPay:
      case BorrowStatus.notPlace:
      case BorrowStatus.notPickUp:
        return [new StatusButton('取消交易', Color.red)];
      case BorrowStatus.notComment:
        return [new StatusButton('評價借方', Color.primary4)];
      default:
        return [new StatusButton('無可執行動作', Color.lightgray, true)];
    }
  }

  clickStatusButton(text: string): void | null {
    switch (text) {
      case '評價租方':
      case '評價借方':
        return this.openCommentDialog(text);
      default:
        return this.openActionDialog(text);
    }
  }

  openActionDialog(title: string): void {
    this.dialog.open(BorrowActionDialogComponent, {
      width: '70%',
      data: {
        title: title,
        rentalId: rental.id,
        isCancel: !title.startsWith('同意'),
      },
    });
  }

  openCommentDialog(title: string): void {
    this.dialog.open(BorrowCommentDialogComponent, {
      width: '50%',
      data: {
        title: title,
        productGroupId: rental.id,
      },
    });
  }

  imageToSliderObject(images: string[]): object[] {
    return images.map((image) => {
      return {
        image: image,
        thumbImage: image,
        alt: 'detail image',
      };
    });
  }
}
