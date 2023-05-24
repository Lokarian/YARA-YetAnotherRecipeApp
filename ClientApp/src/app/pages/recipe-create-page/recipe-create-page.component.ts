import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DomSanitizer} from "@angular/platform-browser";
import {RequestService} from "../../services/request.service";

@Component({
  selector: 'app-recipe-create-page',
  templateUrl: './recipe-create-page.component.html',
  styleUrls: ['./recipe-create-page.component.css']
})
export class RecipeCreatePage {

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    image: [null, Validators.required],
    ingredients: this.fb.array<FormGroup<any>>([this.newIngredient()]),
    steps: this.fb.array<FormGroup<any>>([this.newStep()])
  });

  constructor(private fb: FormBuilder, private domSanitizer: DomSanitizer, private requestService: RequestService) {

  }

  onImageChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.form.controls.image.setValue(file);
    }
  }

  public createIngredient() {
    const ingredient = this.newIngredient();
    this.form.controls.ingredients['controls'].push(ingredient);
  }

  private newIngredient() {
    return this.fb.group({
      name: ['', Validators.required],
      amount: ['', Validators.required]
    });
  }

  removeIngredient(index: number) {
    this.form.controls.ingredients['controls'].splice(index, 1);
  }

  createStep() {
    const step = this.newStep();
    this.form.controls.steps['controls'].push(step);
  }

  private newStep() {
    return this.fb.group({
      description: ['', Validators.required],
    });
  }

  removeStep(index: number) {
    this.form.controls.steps['controls'].splice(index, 1);
  }

  private draggingIndex: number | undefined;

  private _reorderItem(fromIndex: number, toIndex: number): void {
    const itemToBeReordered = this.form.controls.steps.controls.splice(fromIndex, 1)[0];
    this.form.controls.steps.controls.splice(toIndex, 0, itemToBeReordered);
    this.draggingIndex = toIndex;
  }

  onDragStart(index: number): void {
    this.draggingIndex = index;
  }

  onDragEnter(index: number): void {
    if (this.draggingIndex !== index) {
      this._reorderItem(this.draggingIndex ?? 0, index);
    }
  }

  onDragEnd(): void {
    this.draggingIndex = undefined;
  }

  getImageLink(): string | undefined {
    //if form has image return the sanitized url
    if (this.form.controls.image.value) {
      return this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(this.form.controls.image.value)) as string;
    }
    return undefined;
  }

  submit() {
    console.log(this.form.value);
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }
    const data = this.form.value;
    this.requestService.post("recipes", data).subscribe((response) => {
      console.log(response);
    });

  }
}
