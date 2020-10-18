import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { ApiModel } from '@models/api-model';
import {
  ProductGroupFilter,
  ProductType,
} from '@models/product/product-group-filter.model';
import { City } from '@models/city/city.model';
import { Image } from '@models/product/image.model';

import { ProductService } from '@services/api/product.service';

import { ImageCropperDialogComponent } from '@components/image-cropper-dialog/image-cropper-dialog.component';

@Component({
  selector: 'app-product-create',
  templateUrl: './product-create.component.html',
  styleUrls: ['./product-create.component.scss'],
})
export class ProductCreateComponent implements OnInit {
  groupForm!: FormGroup;
  productForm!: FormGroup;
  productTypes: ProductType[] = [];
  city!: City;
  productImages: Image[] = [];
  imageIndex = 0;

  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getCityData();

    this.groupForm = this.formBuilder.group({
      name: [null, [Validators.required]],
      borrowStartDate: [null, [Validators.required]],
      borrowEndDate: [null, [Validators.required]],
      city: [null, [Validators.required]],
      cityAreaName: [null, [Validators.required]],
      price: [null, [Validators.required]],
      bankAccount: [null, [Validators.required]],
      coverImage: [null, [Validators.required]],
      productArrays: [[]],
    });

    this.productForm = this.formBuilder.group({
      name: [null, [Validators.required]],
      count: [null, [Validators.required]],
      productSize: [null, [Validators.required]],
      useInformation: [null],
      relatedLinkArray: [null],
      brand: [null],
      brokenCompensation: [null],
      memo: [null],
      imageArray: [null, [Validators.required]],
    });
  }

  getCityData(): void {
    this.productService
      .getProductFilter()
      .subscribe((response: ApiModel<ProductGroupFilter>) => {
        this.productTypes = response.data.type;
        this.city = response.data.city;
      });
  }

  pushProductArray(): void {
    this.groupForm.value.productArrays.push(this.productForm.value);
  }

  removeProductArray(i: number): void {
    console.log(i);
    this.groupForm.value.productArrays.splice(i);
    console.log(this.groupForm);
  }

  onPreview(): void {
    console.log(this.groupForm.value);
  }

  onSubmit(): void {}

  updateImageIndex(arrow: string) {
    if (arrow === 'previous') {
      this.imageIndex -= 1;
    } else if (arrow === 'next') {
      this.imageIndex += 1;
    }
  }

  openProductImageDialog(action: string): void {
    const dialogRef = this.dialog.open(ImageCropperDialogComponent, {
      width: '70%',
      data: {
        image:
          action === 'update' ? this.productImages[this.imageIndex].image : '',
        action: action,
      },
    });

    dialogRef.afterClosed().subscribe((data) => {
      if (!data) {
        return;
      }

      if (data.action === 'create') {
        this.productImages.push({
          image: data.image,
          thumbImage: data.image,
        });
      } else {
        this.productImages[this.imageIndex] = {
          image: data.image,
          thumbImage: data.image,
        };
        this.productImages = [...this.productImages];
      }

      this.productForm.patchValue({
        imageArray: this.productImages,
      });

      this.imageIndex = 0;
    });
  }

  deleteProductImage(): void {
    this.productImages.splice(this.imageIndex, 1);
    this.imageIndex = 0;
  }
}
