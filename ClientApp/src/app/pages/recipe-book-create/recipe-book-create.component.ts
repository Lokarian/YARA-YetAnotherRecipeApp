import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DomSanitizer} from "@angular/platform-browser";
import {RequestService} from "../../services/request.service";
import {BehaviorSubject, debounceTime} from "rxjs";
import {CurrentUserService} from "../../services/current-user.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-recipe-book-create',
  templateUrl: './recipe-book-create.component.html',
  styleUrls: ['./recipe-book-create.component.css']
})
export class RecipeBookCreateComponent implements OnInit {

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    users: this.fb.array<FormGroup<any>>([])
  });

  public searchedUsers$ = this.requestService.get<{count:number,next:string,previous:string,results:any[]}>('users/?page=1');
  public pageNumber = 1;
  public searchTextSubject = new BehaviorSubject<string>('');
  public currentUser:any;
  private updateBookId:any;
  constructor(private fb: FormBuilder, private domSanitizer: DomSanitizer, private requestService: RequestService,private currentUserService:CurrentUserService,private activatedRoute:ActivatedRoute,private router:Router) {

  }

  ngOnInit() {
    let idParam=this.activatedRoute.snapshot.paramMap.get('id');
    if(idParam){
      this.updateBookId=idParam;
      this.requestService.get<any>(`recipeBooks/${idParam}/`).subscribe((recipeBook)=>{
        this.form.controls.title.setValue(recipeBook.title);
        this.form.controls.description.setValue(recipeBook.description);
        recipeBook.users.forEach((user:any)=>{
          const userForm = this.fb.group({
            username: [user.username, Validators.required],
            access_level: [user.access_level, Validators.required]
          });
          this.form.controls.users.push(userForm);
        });
      });
    }
    else {
      this.currentUserService.currentUser$.subscribe((user)=>{
        if(user){
          const userForm = this.fb.group({
            username: [user.username, Validators.required],
            access_level: ['Full', Validators.required]
          });
          this.form.controls.users.push(userForm);
          this.currentUser = user;
        }
      });
    }
    this.searchTextSubject.asObservable().pipe(debounceTime(500)).subscribe((searchText) => {
      this.pageNumber = 1;
      this.searchForUsers();
    });
  }
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const formData = new FormData();
    formData.append('title', this.form.controls.title.value!);
    if (this.form.controls.description.value) {
      formData.append('description', this.form.controls.description.value);
    }
    formData.append('users', JSON.stringify(this.form.controls.users.value));
    if(this.updateBookId){
      this.requestService.put<any>(`recipeBooks/${this.updateBookId}/`,formData).subscribe((recipeBook)=>{
        this.router.navigate(['/recipeBook',recipeBook.id]);
      });
    }else {
      this.requestService.post<any>('recipeBooks/', formData).subscribe((recipeBook) => {
        this.router.navigate(['/recipeBook', recipeBook.id]);
      });
    }
  }
  searchForUsers() {
    this.searchedUsers$ = this.requestService.get<{count:number,next:string,previous:string,results:any[]}>(`users/?page=${this.pageNumber}&search=${this.searchTextSubject.value}`);
  }
  selectUser(user: any) {
    //if user is not already selected add it to the list
    if(!this.form.controls.users.value.some((value:any)=>value.username===user.username)){
      const userForm = this.fb.group({
        username: [user.username, Validators.required],
        access_level: ['Read', Validators.required]
      });
      this.form.controls.users.push(userForm);
    }
  }
  removeUser(index: number) {
    this.form.controls.users.removeAt(index);
  }

  showUser(user: any) {
    //return true if user is not already selected
    return !this.form.controls.users.value.some((value:any)=>value.username===user.username);
  }

  isOwnUser(username: any) {
    return username === this.currentUser?.username;
  }
}
