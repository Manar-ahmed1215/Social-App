import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from "@angular/router";
import { Posts } from '../../../../core/models/posts.interface';
import { PostsService } from '../../../../core/services/posts.service';
import { PostCommentComponent } from "./post-comment/post-comment.component";
import { PostLiks } from './post-comment/post-liks.interface';
import { UserDetails } from '../../../../core/models/user-details.interface';
import { NgxSpinnerService } from 'ngx-spinner';
import { Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago-pipe';
import { ProfileService } from '../../../../core/services/profile.service';
import { interval } from 'rxjs';
import Swal from 'sweetalert2';
import { MyProfileDetails } from '../../../../core/models/my-profile-details.interface';

@Component({
  selector: 'app-feed-content',
  imports: [ReactiveFormsModule, PostCommentComponent, RouterLink, CommonModule, TimeAgoPipe],
  templateUrl: './feed-content.component.html',
  styleUrl: './feed-content.component.css',
})
export class FeedContentComponent implements OnInit, OnChanges {
  private readonly postsService = inject(PostsService)
  private readonly profileService = inject(ProfileService)
  private spinner = inject(NgxSpinnerService);
  toaster = inject(ToastrService)
  content: FormControl = new FormControl("" ,[Validators.minLength(3)])
  privacy: FormControl = new FormControl("public")
  editPrivacy: FormControl = new FormControl("public")
  shareContent: FormControl = new FormControl("", [Validators.minLength(3)])
  postsList: Posts[] = []
  feedPostsList: Posts[] = []
  savePostsList: Posts[] = []
  myPostsList: Posts[] = []
  myDetaile:MyProfileDetails={} as MyProfileDetails
  postLiks: PostLiks[] = []
  userId: string = ""
  saveFile!: File
  imgUrl: string | ArrayBuffer | null | undefined
  editImgUrl: string | ArrayBuffer | null | undefined;
  commentToggles: { [postId: string]: boolean } = {}
  selectedImage: string | null = null;
  editingPostId: string | null = null;
  editContent: FormControl = new FormControl("");
  isPosting: boolean = false;
  isEdit: boolean = false
  isSavingEdite:boolean=false
  isCancelling: boolean = false; 
  originalPost: Posts | null = null;
  postToShare: Posts | null = null;
  isLoadingLike: string | null = null
  isLoadingSave: string | null = null
  isModalOpen: boolean = false;
  isModalOpenLike: boolean = false;
  selectedPostId: string | null = null;
  selectedPostLikeId: string | null = null;
  openSharePostId: string | null = null;
  openLikesPostId: string | null = null;
  isCommentsModalOpen = false;
  selectedPostIdForComments: string | null = null;
  userData!: UserDetails;
  page: number = 1;
  limit: number = 10;
  allPostsLoaded = false;
  isLoadingPosts = false;
  isFirstLoad: boolean = true;
  isLoadingMore: boolean = false;
  feedPage: number = 1;
  allFeedPostsLoaded = false;
  isLoadingMoreFeed = false;

  myPostsPage: number = 1;
  allMyPostsLoaded = false;
  isLoadingMoreMyPosts = false;

  savedPostsPage: number = 1;
  allSavedPostsLoaded = false;
  isLoadingMoreSaved = false;



  @Input() displayView: string = "friendsPosts"

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['displayView'] && !changes['displayView'].firstChange) {
      this.loadInitialData();
    }
  }

  ngOnInit(): void {
    const data = localStorage.getItem('userData');
    if (data) this.userData = JSON.parse(data);
    this.userId = this.userData?._id;
    this.loadInitialData();
    this.getMyprofile()
  }
  loadInitialData(): void {
    this.page = 1;
    this.feedPage = 1;
    this.myPostsPage = 1;
    this.savedPostsPage = 1;
    this.allPostsLoaded = false;
    this.allFeedPostsLoaded = false;
    this.allMyPostsLoaded = false;
    this.allSavedPostsLoaded = false;

    if (this.displayView === 'all') {
      if (this.postsList.length === 0) this.getAllPostsData();
    }
    else if (this.displayView === 'friendsPosts') {
      if (this.feedPostsList.length === 0) this.getFeedPosts();
    }
    else if (this.displayView === 'myPosts') {
      if (this.myPostsList.length === 0) this.getMyPosts();
    }
    else if (this.displayView === 'mySavedPosts') {
      if (this.savePostsList.length === 0) this.mySavedPosts();
    }
  }


  getMyprofile():void{
    this.profileService.getMyprofile().subscribe({
      next:(res)=>{
        this.myDetaile=res.data.user
        console.log(this.myDetaile)
      }
    })
  }

  getAllPostsData(): void {
    if (this.isLoadingMore || this.allPostsLoaded) return;
    this.isLoadingMore = true;
    this.postsService.getAllPosts(this.page, this.limit).subscribe({
      next: (res) => {
        const newPosts = res.data.posts;
        for (const post of newPosts) {
          this.postsList.push(post);
        }

        if (newPosts.length < this.limit) {
          this.allPostsLoaded = true;
        } else {
          this.page++;
        }

        this.isLoadingMore = false;
        this.spinner.hide();
      },
      error: () => {
        this.isLoadingMore = false;
        this.spinner.hide();
      }
    });
  }

  getFeedPosts(): void {

    if (this.isLoadingMoreFeed || this.allFeedPostsLoaded) return;

    this.isLoadingMoreFeed = true;

    this.postsService.getFeedPosts(this.feedPage, this.limit).subscribe({

      next: (res) => {

        const newPosts = res.data.posts;

        const uniquePosts = newPosts.filter(
          (newPost: any) =>
            !this.feedPostsList.some(
              (existingPost: any) => existingPost._id === newPost._id
            )
        );

        for (let i = 0; i < uniquePosts.length; i++) {
          this.feedPostsList.push(uniquePosts[i]);
        }
        if (uniquePosts.length < this.limit) {
          this.allFeedPostsLoaded = true;
        } else {
          this.feedPage++;
        }

        this.isLoadingMoreFeed = false;

      },

      error: (err) => {
        this.isLoadingMoreFeed = false;
        console.error(err);
      }

    });

  }
  getMyPosts(): void {
    if (this.isLoadingMoreMyPosts || this.allMyPostsLoaded) return;
    this.isLoadingMoreMyPosts = true;
    this.profileService.getUserPosts(this.userData._id, this.myPostsPage, this.limit).subscribe({
      next: (res) => {
        const newPosts = res.data.posts;
        for (let i = 0; i < newPosts.length; i++) {
          this.myPostsList.push(newPosts[i]);
        }

        if (newPosts.length < this.limit) {
          this.allMyPostsLoaded = true;
        } else {
          this.myPostsPage++;
        }
        this.isLoadingMoreMyPosts = false;
      },
      error: (err) => {
        this.isLoadingMoreMyPosts = false;
        console.error(err);
      }
    });
  }

  mySavedPosts(): void {
    if (this.isLoadingMoreSaved || this.allSavedPostsLoaded) return;
    this.isLoadingMoreSaved = true;

    this.profileService.getPostsSaved(this.savedPostsPage, this.limit).subscribe({
      next: (res) => {
        const newPosts = res.data.bookmarks || [];

        if (newPosts.length === 0) {
          this.allSavedPostsLoaded = true;
        } else {
          for (let i = 0; i < newPosts.length; i++) {
            this.savePostsList.push(newPosts[i]);
          }

          if (newPosts.length < this.limit) {
            this.allSavedPostsLoaded = true;
          } else {
            this.savedPostsPage++;
          }
        }
        this.isLoadingMoreSaved = false;
      },
      error: (err) => {
        this.isLoadingMoreSaved = false;
      }
    });
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
      if (isEditing) {
        this.editImgUrl = e.target?.result;
      } else {
        this.imgUrl = e.target?.result;
      }
    };
  }

submitForm(e: Event, form: HTMLFormElement): void {
  e.preventDefault();
  if (!this.content.value && !this.saveFile) return; 

  this.isPosting = true; 

  const formData = new FormData();
  if (this.content.value) formData.append("body", this.content.value);
  if (this.privacy.value) formData.append("privacy", this.privacy.value);
  if (this.saveFile) formData.append("image", this.saveFile);

  this.toaster.info("Publishing your post...", '', {
    progressBar: true,
    timeOut: 2000,
  });

  this.postsService.createPosts(formData).subscribe({
    next: (res) => {
      this.isPosting = false; 
      if (res.success) {
        let newPost = res.data.post;
        newPost.user = {
          ...newPost.user,
          _id: this.userId,
          photo: this.userData.photo,
          name: this.userData.name,
          username: this.userData.username
        };
        if(this.displayView === 'all'){
          this.postsList.unshift(newPost);
        } else if(this.displayView === 'friendsPosts'){
          this.feedPostsList.unshift(newPost);
        } else if(this.displayView === 'myPosts'){
          this.myPostsList.unshift(newPost);
        } else if(this.displayView === 'mySavedPosts'){
          this.savePostsList.unshift(newPost);
        }

        this.toaster.clear();
        this.toaster.success("Post published successfully!");
        form.reset();
        this.imgUrl = "";
        this.saveFile = undefined!;
        this.postsService.setCachedPosts(this.filteredPosts, 1, false);
      }
    },
    error: (err) => {
      this.isPosting = false;
      console.log(err);
      this.toaster.error("Failed to publish post");
    }
  });
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
              const removePostFromList = (list: Posts[]) => {
                const index = list.findIndex(p => p._id === postId);
                if (index !== -1) list.splice(index, 1);
              };

              removePostFromList(this.postsList);
              removePostFromList(this.feedPostsList);
              removePostFromList(this.myPostsList);
              removePostFromList(this.savePostsList);
              this.postsList = this.postsList.slice();
              this.feedPostsList = this.feedPostsList.slice();
              this.myPostsList = this.myPostsList.slice();
              this.savePostsList = this.savePostsList.slice();

              Swal.fire('Deleted!', 'Your post has been deleted.', 'success');
            }

          },
          error: (err) => {
            console.log(err);

          }

        });

      }

    });

  }
  setDataEdit(post: Posts) {
    this.originalPost = { ...post };
    this.editingPostId = post._id;
    this.editContent.setValue(post.body);
    this.editImgUrl = post.image || null;
    this.saveFile = undefined!;
  }
updatePost(postId: string): void {
  this.isSavingEdite = true;
  const formData = new FormData();
  if (this.editContent.value) formData.append("body", this.editContent.value);
  if (this.saveFile) formData.append("image", this.saveFile);
  if (!this.editImgUrl && !this.saveFile) formData.append("removeImage", "true");

  this.toaster.info("Updating post...", '', { timeOut: 1000, progressBar: true });

  this.postsService.updatePost(postId, formData).subscribe({
    next: (res) => {
      if (res.success) {
        const updatedPostFromServer = res.data.post;

        const updatePostInList = (list: Posts[]) => {
          const index = list.findIndex(p => p._id === postId);
          if (index !== -1) {
            list[index] = { 
              ...list[index], 
              ...updatedPostFromServer,
              user: list[index].user
            };
          }
        };

        updatePostInList(this.postsList);
        updatePostInList(this.feedPostsList);
        updatePostInList(this.myPostsList);
        updatePostInList(this.savePostsList);
        this.postsList = this.postsList.slice();
        this.feedPostsList = this.feedPostsList.slice();
        this.myPostsList = this.myPostsList.slice();
        this.savePostsList = this.savePostsList.slice();

        this.isSavingEdite = false;
        this.toaster.success("Post updated successfully!");
        this.cancelEdit();
      }
    },
    error: (err) => {
      this.toaster.error("Failed to update post");
      console.log(err);
      this.isSavingEdite = false;
    }
  });
}
  updatePrivacyDirectly(postId: string, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newPrivacy = selectElement.value;
    const formData = new FormData();
    formData.append("privacy", newPrivacy);
    this.toaster.info("Updating privacy...", '', { timeOut: 800 });
    this.postsService.updatePost(postId, formData).subscribe({
      next: (res) => {
        if (res.success) {
          const index = this.postsList.findIndex(p => p._id === postId);
          if (index !== -1) {
            this.postsList[index].privacy = newPrivacy;
            this.postsList = [...this.postsList];
          }

          this.postsService.setCachedPosts(this.postsList, this.page, this.allPostsLoaded);
          this.toaster.success("Privacy updated!");
        }
      },
      error: (err) => {
        this.toaster.error("Failed to update privacy");
        console.error(err);
      }
    });
  }
  cancelEdit() {
    this.isCancelling=true
    this.editingPostId = null;
    this.editContent.reset();
    this.editImgUrl = "";
    this.saveFile = undefined!;
    this.isCancelling=false
  }
  clearSelectedImage(fileInput: HTMLInputElement) {
    this.editImgUrl = null;
    this.saveFile = undefined!;
    fileInput.value = '';
  }
  likeOrUnlikePost(postId: string) {
    this.isLoadingLike = postId;

    this.postsService.likeOrUnlikePost(postId).subscribe({
      next: (res) => {

        const updateLikes = (list: Posts[]) => {
          const post = list.find(p => p._id === postId);
          if (post) {
            post.likesCount = res.data.likesCount;
            if (post.likes.includes(this.userId)) {
              post.likes = post.likes.filter(id => id !== this.userId);
            } else {
              post.likes.push(this.userId);
            }
          }
        };

        updateLikes(this.postsList);
        updateLikes(this.feedPostsList);
        updateLikes(this.myPostsList);
        updateLikes(this.savePostsList);
        this.postsList = this.postsList.slice();
        this.feedPostsList = this.feedPostsList.slice();
        this.myPostsList = this.myPostsList.slice();
        this.savePostsList = this.savePostsList.slice();

        this.isLoadingLike = null;
      },
      error: (err) => {
        console.log(err);
        this.isLoadingLike = null;
      }
    });
  }
  getPostLike(postId: string): void {
    this.openLikesPostId = postId;
    this.postsService.getLikePost(postId).subscribe({
      next: (res) => {
        this.postLiks = res.data.likes
      },
      error: (err) => {
        console.log(err)
      }
    })
  }
  saveOrUnsavePost(postId: string) {
    this.isLoadingSave = postId;

    this.postsService.saveOrUnsavePost(postId).subscribe({
      next: (res) => {
        if (res.success) {

          const updateBookmarked = (list: Posts[], removeFromSaved: boolean = false) => {
            const index = list.findIndex(p => p._id === postId);
            if (index !== -1) {
              list[index].bookmarked = !list[index].bookmarked;
              if (removeFromSaved && !list[index].bookmarked) {
                list.splice(index, 1);
              }
            }
          };

          updateBookmarked(this.postsList);
          updateBookmarked(this.feedPostsList);
          updateBookmarked(this.myPostsList);
          updateBookmarked(this.savePostsList, true);
          this.postsList = this.postsList.slice();
          this.feedPostsList = this.feedPostsList.slice();
          this.myPostsList = this.myPostsList.slice();
          this.savePostsList = this.savePostsList.slice();
        }

        this.isLoadingSave = null;
      },
      error: (err) => {
        console.log(err);
        this.isLoadingSave = null;
      }
    });
  }
  sharePost(e: Event, postId: string) {
    e.preventDefault();
    this.openSharePostId = postId;
    let obj = this.shareContent.value === "" ? {} : { body: this.shareContent.value };
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
          this.postsService.getAllPosts(1).subscribe({
            next: (refreshRes) => {
              this.postsList = refreshRes.data.posts;
              this.postsService.setCachedPosts(this.postsList, 2, false);
            }
          });
        }
      },
      error: (err) => {
        this.toaster.error("Failed to share post");
      }
    });
  }


  toggleComments(postId: string) {
    this.commentToggles[postId] = !this.commentToggles[postId]
  }

  isCommentsVisible(postId: string) {
    return !!this.commentToggles[postId]
  }


  openImage(imgUrl: string) {
    this.selectedImage = imgUrl;
  }

  closeImage() {
    this.selectedImage = null;
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
  closeLikeModal() {
    this.isModalOpenLike = false;
    this.selectedPostLikeId = null;
    this.postLiks = [];
  }
  openLikeModal(post: Posts) {
    this.selectedPostLikeId = post._id;
    this.isModalOpenLike = true;
    this.openLikesPostId = post._id;
  }


  openCommentsModal(postId: string) {
    this.selectedPostIdForComments = postId;
    this.isCommentsModalOpen = true;
  }

  closeCommentsModal() {
    this.selectedPostIdForComments = null;
    this.isCommentsModalOpen = false;
  }



  get filteredPosts() {
    if (this.displayView === 'myPosts') {
      return this.myPostsList;
    }

    if (this.displayView === 'mySavedPosts') {
      return this.savePostsList;
    }
    if (this.displayView === 'friendsPosts') {
      return this.feedPostsList

    }
    return this.postsList

  }
  get isCurrentLoading() {
    if (this.displayView === 'all') return this.isLoadingMore
    if (this.displayView === 'friendsPosts') return this.isLoadingMoreFeed
    if (this.displayView === 'myPosts') return this.isLoadingMoreMyPosts
    if (this.displayView === 'mySavedPosts') return this.isLoadingMoreSaved
    return false
  }

 
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const pos = (document.documentElement.scrollTop || document.body.scrollTop) + document.documentElement.offsetHeight;
    const max = document.documentElement.scrollHeight;
    if (pos > max - 100 && !this.isCurrentLoading) {
      if (this.displayView === 'all' && !this.allPostsLoaded) this.getAllPostsData();
      if (this.displayView === 'friendsPosts' && !this.allFeedPostsLoaded) this.getFeedPosts();
      if (this.displayView === 'myPosts' && !this.allMyPostsLoaded) this.getMyPosts();
      if (this.displayView === 'mySavedPosts' && !this.allSavedPostsLoaded) this.mySavedPosts();
    }
  }
}
