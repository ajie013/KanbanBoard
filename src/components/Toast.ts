export default class Toast{
    private toastWrapper: HTMLDivElement;
    private toastTitle: HTMLHeadingElement;
    private toastContent: HTMLParagraphElement;
    private toastClose: HTMLButtonElement

    constructor(toastWrapper: string, toastTitle: string, toastContent: string, toastClose: string){
        this.toastWrapper = document.querySelector(toastWrapper) as HTMLDivElement;
        this.toastClose = document.querySelector(toastClose) as HTMLButtonElement;
        this.toastTitle = document.querySelector(toastTitle) as HTMLHeadingElement;
        this.toastContent = document.querySelector(toastContent) as HTMLParagraphElement

        if(this.toastClose){
            this.toastClose.addEventListener("click", () =>{
                this.toastWrapper.style.display = "none"
                this.toastContent.innerHTML = "";
                this.toastTitle.innerHTML = ""
            })
        }
    }

    showToast = (title: string, content: string) =>{
        this.toastWrapper.style.display = "block"
        this.toastTitle.innerHTML = title;
        this.toastContent.innerHTML = content;

        setTimeout(() => {
            this.toastWrapper.style.display = "none"
            this.toastContent.innerHTML = "";
            this.toastTitle.innerHTML = ""
        }, 2000);
    }
}