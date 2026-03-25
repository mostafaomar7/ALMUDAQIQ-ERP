import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProfileUser } from './profile-user.service';

@Component({
  selector: 'app-secretary-profle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './secretary-profle.html',
  styleUrl: './secretary-profle.css',
})
export class SecretaryProfle implements OnInit {
  private profileService = inject(ProfileUser);
  private fb = inject(FormBuilder);

  profileForm!: FormGroup;
  userData: any = {};

  editModes = {
    profileInfo: false,
    workContact: false,
    securityAccess: false
  };

  ngOnInit(): void {
    this.initForm();
    this.loadProfile();
  }

  initForm() {
    this.profileForm = this.fb.group({
      fullName: [{ value: '', disabled: true }],
      suggestedUsername: [{ value: '', disabled: true }],
      jobTitle: [{ value: '', disabled: true }],
      startDate: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
      phone: [{ value: '', disabled: true }],
      language: [{ value: '', disabled: true }],
      timeZone: [{ value: '', disabled: true }],
      workLocation: [{ value: '', disabled: true }],
      emailSignature: [{ value: '', disabled: true }],
      employeeId: [{ value: '', disabled: true }],
      recoveryEmail: [{ value: '', disabled: true }],
      emergencyContact: [{ value: '', disabled: true }],
    });
  }

  loadProfile() {
    this.profileService.getProfile().subscribe({
      next: (res) => {
        // التأكد إن الداتا موجودة في res.user
        if (res && res.user) {
          this.userData = res.user;
          this.patchFormValues();
        }
      },
      error: (err) => console.error('Error loading profile', err)
    });
  }

  patchFormValues() {
    const user = this.userData;

    // تظبيط التاريخ لو موجود
    const startDateFormatted = user.startDate
      ? new Date(user.startDate).toISOString().split('T')[0]
      : '';

    // إستخدام || '' عشان لو القيمة null متعملش مشكلة في الفورم
    this.profileForm.patchValue({
      fullName: user.fullName || '',
      suggestedUsername: user.suggestedUsername || '',
      jobTitle: user.jobTitle || '',
      startDate: startDateFormatted,
      email: user.email || '',
      phone: user.phone || '',
      language: user.language || '',
      timeZone: user.timeZone || '',
      workLocation: user.workLocation || '',
      emailSignature: user.emailSignature || '',
      employeeId: user.employeeId || '',
      recoveryEmail: user.recoveryEmail || '',
      emergencyContact: user.emergencyContact || '',
    });
  }

  toggleEdit(section: 'profileInfo' | 'workContact' | 'securityAccess') {
    this.editModes[section] = true;
    const controls = this.getControlsForSection(section);
    controls.forEach(c => this.profileForm.get(c)?.enable());
  }

  saveSection(section: 'profileInfo' | 'workContact' | 'securityAccess') {
    const updatedData = this.profileForm.getRawValue();

    this.profileService.updateProfile(updatedData).subscribe({
      next: (res) => {
        this.editModes[section] = false;
        const controls = this.getControlsForSection(section);
        controls.forEach(c => this.profileForm.get(c)?.disable());
      },
      error: (err) => console.error('Error updating profile', err)
    });
  }

  private getControlsForSection(section: string): string[] {
    switch(section) {
      case 'profileInfo': return ['fullName', 'suggestedUsername', 'jobTitle', 'startDate'];
      case 'workContact': return ['email', 'phone', 'language', 'timeZone', 'workLocation', 'emailSignature'];
      case 'securityAccess': return ['employeeId', 'recoveryEmail', 'emergencyContact'];
      default: return [];
    }
  }
  // ضيف ده جوه كلاس SecretaryProfle
get userInitials(): string {
  // بنجيب القيمة من الفورم، ولو فاضية بنجيبها من الداتا، ولو مفيش بنرجع string فاضي
  const name = this.profileForm.get('fullName')?.value || this.userData?.fullName || '';
  return name.substring(0, 2).toUpperCase();
}
}
