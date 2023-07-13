import {Component, ElementRef, OnInit, QueryList, ViewChildren} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DomSanitizer} from "@angular/platform-browser";
import {RequestService} from "../../services/request.service";
import {NotificationService} from "../../services/notification.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-recipe-create-page',
  templateUrl: './recipe-create-page.component.html',
  styleUrls: ['./recipe-create-page.component.css']
})
export class RecipeCreatePage implements OnInit {

  public recipeBooks: any[] = [];
  public existingRecipe: any | undefined;
  form = this.createForm();

  @ViewChildren('textareaRef') textareas: QueryList<ElementRef<HTMLTextAreaElement>>;

  public importLoading = false;
  public generateLoading = false;

  constructor(private fb: FormBuilder,
              private domSanitizer: DomSanitizer,
              private requestService: RequestService,
              private notificationService: NotificationService,
              private router: Router,
              private activatedRoute:ActivatedRoute) {

  }

  ngOnInit(): void {
    this.requestService.get<any[]>(`recipeBooks/?write=true`).subscribe(books => {
      this.recipeBooks = books;
    });
    if(this.activatedRoute.snapshot.params["id"]){
      this.requestService.get<any>(`recipes/${this.activatedRoute.snapshot.params["id"]}/`).subscribe(recipe=>{
        this.existingRecipe = recipe;
        this.form = this.createForm();
        this.form.patchValue({
          title: recipe.title,
          description: recipe.description,
          recipeBookId: recipe.recipe_book
        });
        this.form.controls.ingredients.clear();
        this.form.controls.steps.clear();
        recipe.ingredients.forEach((ingredient: any) => {
          this.form.controls.ingredients.push(this.newIngredient(ingredient));
        });
        recipe.steps.forEach((step: any) => {
          this.form.controls.steps.push(this.newStep({description: step.description}));
        });
        //get image from recipe.image as url, create file from it and set it as image
        this.requestService.getBlobDirect(recipe.image).subscribe((response:any) => {
          const file = new File([response], "image.png", {type: "image/png"});
          this.form.controls.image.setValue(file);
        });

        //resize textareas to fit content
        setTimeout(() => {
          this.textareas.forEach((textarea) => {
            textarea.nativeElement.style.height = textarea.nativeElement.scrollHeight + "px";
          });
        }, 0);
      });
    }
  }

  onImageChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.form.controls.image.setValue(file);
    }
  }

  private createForm() {
    return this.fb.group({
      title: ['', Validators.required],
      description: [''],
      image: [null as (File|null), Validators.required],
      ingredients: this.fb.array<FormGroup<any>>([this.newIngredient()]),
      steps: this.fb.array<FormGroup<any>>([this.newStep()]),
      recipeBookId: [null, Validators.required]
    });
  }

  public createIngredient() {
    const ingredient = this.newIngredient();
    this.form.controls.ingredients.push(ingredient);
  }

  private newIngredient(data?: any) {
    return this.fb.group({
      name: [data?.name ?? "", Validators.required],
      amount: [data?.amount ?? ""]
    });
  }

  removeIngredient(index: number) {
    this.form.controls.ingredients.removeAt(index);
  }

  createStep() {
    const step = this.newStep();
    this.form.controls.steps.push(step);
  }

  private newStep(data?: any) {
    return this.fb.group({
      description: [data?.description ?? '', Validators.required],
    });
  }

  removeStep(index: number) {
    this.form.controls.steps.removeAt(index);
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
      let url=this.form.controls.image.value;
      if(url.startsWith("http://") && window.location.protocol=="https:"){
        url=url.replace("http://","https://");
      }
      return this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(url)) as string;
    }
    return undefined;
  }

  submit() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }
    const formData = new FormData();
    formData.append('title', this.form.get('title')?.value!);
    formData.append('description', this.form.get('description')?.value!);
    formData.append('image', this.form.get('image')?.value!);
    formData.append('recipeBookId', this.form.get('recipeBookId')?.value!);

    const ingredients = this.form.get('ingredients')?.value;
    const steps = this.form.get('steps')?.value;

    // Append ingredients and steps as JSON data to the form data
    formData.append('ingredients', JSON.stringify(ingredients));
    formData.append('steps', JSON.stringify(steps!.map((step: any, i) => {
      return {...step, step_number: i}
    })));
    if(this.existingRecipe){
      this.requestService.put(`recipes/${this.existingRecipe.id}/`, formData).subscribe((response) => {
        this.router.navigate(["/recipe", this.existingRecipe.id]);
      });
    }
    else{
      this.requestService.post("recipes/", formData).subscribe((response:any) => {
        this.router.navigate(["/recipe", response.id]);
      });
    }

  }

  importUrl(value: string) {
    if (!value) return;
    this.importLoading = true;
    this.requestService.post<any>("processUrl/", {url: value}).subscribe({
      next: (response) => {
        this.form = this.createForm();
        this.form.patchValue({
          title: response.title,
          description: response.description,
        });
        this.form.controls.ingredients.clear();
        this.form.controls.steps.clear();
        response.ingredients.forEach((ingredient: any) => {
          this.form.controls.ingredients.push(this.newIngredient(ingredient));
        });
        response.instructions_list.forEach((step: any) => {
          this.form.controls.steps.push(this.newStep({description: step}));
        });
        //resize textareas to fit content
        setTimeout(() => {
          this.textareas.forEach((textarea) => {
            textarea.nativeElement.style.height = textarea.nativeElement.scrollHeight + "px";
          });
        }, 0);
        this.importLoading = false;
        this.requestService.getBlob(`imageProxy/?url=${response.image}`).subscribe((image) => {
          const imageFile = new File([image], "image.jpg", {type: image.type});
          this.form.controls.image.setValue(imageFile as any);
        });
      }, error: () => {
        this.importLoading = false;
        this.notificationService.error("Could not import recipe from url");
      }
    });
  }

  generateImages() {
    let data = this.form.value;
    this.generateLoading = true;
    delete data.image;
    this.requestService.post<any>("generateRecipeThumbnail/", {recipe_json: JSON.stringify(data)}).subscribe({
      next: (response) => {
        console.log(response);
        const base64 = response[0];
        const byteCharacters = atob(base64);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
          const slice = byteCharacters.slice(offset, offset + 1024);

          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }

          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        const blob = new Blob(byteArrays, {type: 'image/png'});

        const file = new File([blob], 'filename.png', {type: 'image/png'});

        this.form.controls.image.setValue(file as any);
        this.generateLoading = false;
      }, error: () => {
        this.notificationService.error("Could not generate image");
        this.generateLoading = false;
      }

    });
  }
}
