import { Component, inject, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PostsService } from '../../core/services/posts.service';
import { Posts } from '../../core/models/posts.interface';
import { PostCommentComponent } from "../feed/components/feed-content/post-comment/post-comment.component";
import { TimeAgoPipe } from '../../shared/pipes/time-ago-pipe';
import { UserDetails } from '../../core/models/user-details.interface';
import { ToastrService } from 'ngx-toastr';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-post-details',
  imports: [RouterLink, PostCommentComponent, TimeAgoPipe, ReactiveFormsModule],
  templateUrl: './post-details.component.html',
  styleUrl: './post-details.component.css',
})
export class PostDetailsComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute)
  private readonly postsService = inject(PostsService)
  private readonly location = inject(Location)
  postId: string = ""
  postDetails: Posts = {} as Posts
  userId: string = ''
  userData!: UserDetails;
  isLoadingLike: string | null = null
  isCommentsOpen: boolean = true;
  toaster = inject(ToastrService)
  openSharePostId: string | null = null;
  selectedPostId: string | null = null;
  postToShare: Posts | null = null;
  isModalOpen: boolean = false;
  postsList: Posts[] = [];
  shareContent = new FormControl('');
  editContent = new FormControl('');
  imgUrl: string | ArrayBuffer | null = null;
  selectedImage: string | null = null;
  originalPost!: Posts;
  editingPostId: string | null = null;
  isLoadingSave: string | null = null;
  editImgUrl: string | null = null;
  saveFile!: File;
  showUnavailableMessage: boolean = false;
  ngOnInit(): void {
    const data = localStorage.getItem('userData');
    if (data) this.userData = JSON.parse(data);

    this.userId = JSON.parse(localStorage.getItem("userData")!)?._id;

    this.activatedRoute.paramMap.subscribe((param) => {
      this.postId = param.get('id')!;

      if (this.postId === 'unavailable') {
        this.showUnavailableMessage = true;
      } else {
        this.showUnavailableMessage = false;
        this.getPostDetails();
      }
    })
  }
  getPostDetails(): void {
    this.postsService.getSinglePost(this.postId).subscribe({
      next: (res) => {
        this.postDetails = res.data.post
      },
      error: (err) => {
        console.log(err)
      }
    })
  }
  backPage(): void {
    this.location.back()
  }



  likeOrUnlikePost(postId: string) {
    this.isLoadingLike = postId;

    this.postsService.likeOrUnlikePost(postId).subscribe({
      next: (res) => {

        this.postDetails.likesCount = res.data.likesCount;

        if (this.postDetails.likes.includes(this.userId)) {
          this.postDetails.likes = this.postDetails.likes.filter(id => id !== this.userId);
        }
        else {
          this.postDetails.likes.push(this.userId);
        }

        this.isLoadingLike = null;
      }
    });
  }

  sharePost(e: Event, postId: string) {
    e.preventDefault();
    this.openSharePostId = postId;
    const obj = this.shareContent.value ? { body: this.shareContent.value } : {};
    this.toaster.info("Sharing post...", '', {
      progressBar: true,
      timeOut: 1500
    });

    this.postsService.sharePost(postId, obj).subscribe({
      next: (res) => {
        if (res.success) {
          this.toaster.success("Post shared successfully!");
          this.closeModal();
          this.shareContent.reset();

        }

      },
      error: () => {
        this.toaster.error("Failed to share post");
      }
    });
  }
  openModal(post: Posts) {
    this.selectedPostId = post._id;
    this.postToShare = post;
    this.isModalOpen = true;
    this.openSharePostId = post._id;
  }
  closeModal() {
    this.isModalOpen = false;
    this.selectedPostId = null;
    this.postToShare = null;
  }

  toggleComments() {
    this.isCommentsOpen = !this.isCommentsOpen;
  }


  deletePost(postId: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to delete this post?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.postsService.deletePost(postId).subscribe({
          next: (res) => {
            if (res.success) {
              Swal.fire(
                'Deleted!',
                'Your post has been deleted.',
                'success'
              );
              this.backPage();
            }

          },

          error: (err) => {

            console.log(err);

            Swal.fire(
              'Error!',
              'Something went wrong while deleting the post.',
              'error'
            );

          }

        });

      }

    });

  }
  setDataEdit(post: Posts): void {
    this.originalPost = { ...post };
    this.editingPostId = post._id;
    this.editContent.setValue(post.body);
    this.editImgUrl = post.image || null;
    this.saveFile = undefined!;

  }
  updatePost(postId: string): void {

    const formData = new FormData();

    if (this.editContent.value) {
      formData.append("body", this.editContent.value);
    }

    if (this.saveFile) {
      formData.append("image", this.saveFile);
    }

    if (!this.editImgUrl && !this.saveFile) {
      formData.append("removeImage", "true");
    }

    this.toaster.info("Updating post...", '', {
      timeOut: 1000,
      progressBar: true
    });

    this.postsService.updatePost(postId, formData).subscribe({

      next: (res) => {

        if (res.success) {

          this.postDetails.body = res.data.post.body;
          this.postDetails.image = res.data.post.image;
          this.postDetails.privacy = res.data.post.privacy;

          this.toaster.success("Post updated successfully!");

          this.cancelEdit();

        }

      },

      error: (err) => {

        this.toaster.error("Failed to update post");

        console.log(err);

      }

    });

  }
  cancelEdit() {
    this.editingPostId = null;
    this.editContent.reset();
    this.editImgUrl = "";
    this.saveFile = undefined!;
  }


  saveOrUnsavePost(postId: string) {

    this.isLoadingSave = postId;

    this.postsService.saveOrUnsavePost(postId).subscribe({

      next: () => {

        this.postDetails.bookmarked = !this.postDetails.bookmarked;

        this.isLoadingSave = null;
      },

      error: (err) => {
        console.log(err);
        this.isLoadingSave = null;
      }

    });
  }
  clearSelectedImage(fileInput: HTMLInputElement) {
    this.editImgUrl = null;
    this.saveFile = undefined!;
    fileInput.value = '';
  }
  selectImage(e: Event, isEditing: boolean = false): void {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.saveFile = input.files[0];
      this.showFile(isEditing);
    }
  }

  showFile(isEditing: boolean): void {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(this.saveFile);
    fileReader.onload = (e: ProgressEvent<FileReader>) => {
      const result = e.target?.result as string | null;
      if (isEditing) {
        this.editImgUrl = result;
      } else {
        this.imgUrl = result;
      }
    };
  }

  openImage(imgUrl: string) {
    this.selectedImage = imgUrl;
  }
  closeImage() {
    this.selectedImage = null;
  }
}
