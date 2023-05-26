import mongoose from "mongoose";

interface UserAttrs {
    email:string,
    password:string
}

interface UserModel extends mongoose.Model<UserAttrs> {

}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    }
})

userSchema.statics.build = (attrs:UserAttrs)=> new User(attrs)

const User = mongoose.model('User', userSchema)
userSchema.statics.build  
export { User }