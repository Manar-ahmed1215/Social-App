import { Component, inject, OnInit } from '@angular/core';
import { ProfileService } from '../../core/services/profile.service';
import { MyProfileDetails } from '../../core/models/my-profile-details.interface';
import { MyPostsComponent } from "./components/my-posts/my-posts.component";
import { MyPostsSavedComponent } from "./components/my-posts-saved/my-posts-saved.component";

@Component({
  selector: 'app-profile',
  standalone: true, 
  imports: [MyPostsComponent, MyPostsSavedComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  private readonly profileService = inject(ProfileService);
  myProfile: MyProfileDetails = {} as MyProfileDetails;
  saveFile!: File;
  imgUrl: string | ArrayBuffer | null | undefined;
  editImgUrl: string | ArrayBuffer | null | undefined;
  activeTab: 'myPosts' | 'saved' = 'myPosts';
  selectedImage: string | null = null;
  saveCoverFile!: File;
  coverImgUrl: string | ArrayBuffer | null | undefined;
  totalPosts: number = 0;
  totalSavedPosts: number = 0
  isLoading: boolean = true;

  ngOnInit(): void {
    this.getMyProfileData();
  }

  updateTotalPosts(count: number) {
    this.totalPosts = count;
  }
  updateTotalPostsSaved(count: number) {
    this.totalSavedPosts = count
  }

  getMyProfileData(): void {
    this.isLoading = true;
    this.profileService.getMyprofile().subscribe({
      next: (res) => {
        this.myProfile = res.data.user;
        this.profileService.updateUserProfile(res.data.user);
        this.isLoading = false;

      },
      error: (err) => {
        console.log(err)
        this.isLoading = false
      }
    });
  }

  selectImage(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.saveFile = input.files[0];
      this.showFile();
      this.uploadProfileImage();
    }
  }

  uploadProfileImage(): void {
    const formData = new FormData();
    formData.append("photo", this.saveFile);

    this.profileService.uploadMyprofilePhoto(formData).subscribe({
      next: (res) => {
        // console.log(res);
        this.myProfile.photo = res.user.photo;
        this.profileService.updateUserProfile(res.user);
      },
      error: (err) => {
        console.log( err)
      }
    });
  }

  showFile(): void {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(this.saveFile);
    fileReader.onload = (e) => {
      this.imgUrl = e.target?.result as string;
    };
  }
  uploadCoverImage(): void {
    const formData = new FormData();
    formData.append("cover", this.saveCoverFile);

    this.profileService.uploadMyCoverPhoto(formData).subscribe({
      next: (res) => {
        this.myProfile = { ...this.myProfile, cover: res.user.cover };
        this.coverImgUrl = undefined;

        this.profileService.updateUserProfile(res.user);
      },
      error: (err) =>{
        console.log(err)
      } 
    });
  }
  showCoverFile(): void {
    const reader = new FileReader();
    reader.readAsDataURL(this.saveCoverFile);

    reader.onload = (e) => {
      this.coverImgUrl = e.target?.result as string;
    };
  }
  selectCoverImage(e: Event): void {
    const input = e.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.saveCoverFile = input.files[0];
      this.showCoverFile();
      this.uploadCoverImage();
    }
  }


  setActiveTab(active: 'myPosts' | 'saved') {
    this.activeTab = active;
  }

  openImage(imgUrl: string) {
    this.selectedImage = imgUrl;
  }

  closeImage() {
    this.selectedImage = null;
  }



}