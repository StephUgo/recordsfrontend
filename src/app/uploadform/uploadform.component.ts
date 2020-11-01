import { Component,  Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-uploadform',
  templateUrl: './uploadform.component.html',
  styleUrls: ['./uploadform.component.css']
})
export class UploadFormComponent {

  @Output() public uploadCoverRequested: EventEmitter<FormData> = new EventEmitter<FormData>();
  formData: FormData | null = null;

  /**
   * Handler for cover file changed
   */
  onFileChange(coverfile: any) {
    console.log('file changed to ', coverfile);
    this.formData = new FormData();
    for (let index = 0; index < coverfile.length; index++) {
      this.formData.append('picture', coverfile[index], coverfile[index]['name']);
    }
  }

  /**
   * Handler for cover upload event (form submit)
   */
  onClickUpload() {
    if (this.formData !== null) {
      this.uploadCoverRequested.emit(this.formData);
    }
  }
}
