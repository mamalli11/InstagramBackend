export enum BadRequestMessage {
	InValidLoginData = "اطلاعات ارسال شده برای ورود صحیح نمیباشد",
	InValidRegisterData = "اطلاعات ارسال شده برای ثبت نام صحیح نمیباشد",
	SomeThingWrong = "خطایی پیش آمده مجددا تلاش کنید",
}
export enum AuthMessage {
	NotFoundAccount = "حساب کاربری یافت نشد",
	TryAgain = "دوباره تلاش کنید",
	AlreadyExistAccount = "حساب کاربری با این مشخصات قبلا وجود دارد",
	ExpiredCode = "کد تایید منقصی شده مجددا تلاش کنید.",
	LoginAgain = "مجددا وارد حساب کاربری خود شوید",
	LoginIsRequired = "وارد حساب کاربری خود شوید",
	Forbidden = "شما دسترسی لازم برای این عملیات را ندارید",
}
export enum NotFoundMessage {
	NotFound = "موردی یافت نشد",
	NotFoundHashtag = "هشتگ یافت نشد",
	NotFoundPost = "پست یافت نشد",
	NotFoundUser = "کاربری یافت نشد",
	NotFoundStory = "استوری یافت نشد",
}
export enum ValidationMessage {
	InvalidImageFormat = "فرمت تصریر انتخاب شده باید ار نوع jpg و png باشد",
	InvalidEmailFormat = "ایمیل وارد شده صحیح نمیباشد",
	InvalidPhoneFormat = "شماره موبایل وارد شده صحیح نمیباشد",
}
export enum PublicMessage {
	SentOtp = "کد یکبار مصرف با موفقیت ارسال شد",
	LoggedIn = "با موفقیت وارد حساب کاربری خود شدید",
	Created = "با موفقیت ایجاد شد",
	Deleted = "با موفقیت حذف شد",
	Updated = "با موفقیت به روز رسانی شد",
	Inserted = "با موفقیت درج شد",
	Like = "پست با موفقیت لایک شد",
	DisLike = "لایک شما از پست برداشته شد",
	Bookmark = "پست با موفقیت ذخیره شد",
	UnBookmark = " پست از لیست پست ها ذخیره شده برداشته شد",
	CreatedComment = " نظر شما با موفقیت ثبت شد",
	Successfuly = "درخواست باموفقیت انجام شد",
}
export enum ConflictMessage {
	CategoryTitle = "عنوان دسته بندی قبلا ثبت شده است",
	Email = "ایمیل توسط شخص دیگری استفاده شده",
	Phone = "موبایل توسط شخص دیگری استفاده شده",
	Username = "تام کاربری توسط شخص دیگری استفاده شده",
}
