

export class ChangePassUserDto{
    private constructor(
        public userName: string,
        public password: string,
        public newPassword: string,
    ){}
    static create( object : {[key:string]:any} ): [string? , ChangePassUserDto?] {
       const { userName, password, newPassword} = object;
       

       if ( !userName ) {
           return ['nombre de usuario es requerido', undefined];
       }
       if ( !password ) {
           return ['Contraseña es requerida', undefined];
       }
       if ( password.length < 5 ) {
           return ['La contraseña debe tener al menos 5 caracteres', undefined];
       }
       if ( !newPassword ) {
           return ['Contraseña es requerida', undefined];
       }
       if ( newPassword.length < 5 ) {
           return ['La nueva contraseña debe tener al menos 5 caracteres', undefined];
       }
       return [undefined, new ChangePassUserDto(userName, password, newPassword)];
    }
}