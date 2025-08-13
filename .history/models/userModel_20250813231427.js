const mongoose= require('mongoose')
const bcrypt=require('brcypt')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v);
        },
        message: props => `${props.value} is not a valid email!`
      }
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false
    },
    currency: {
      type: String,
      enum: ['₦', '$', '€', '£'],
      default: '₦'
    },
    categories: [{
      name: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['income', 'expense'],
        required: true
      },
      icon: {
        type: String,
        default: '💰'
      },
      color: {
        type: String,
        default: '#4CAF50'
      }
    }]
  },
  {
    timestamps: true // Adds createdAt and updatedAt automatically
  }
);


userSchema.pre('save', async function(next){
  if(!this.isModified('password')) return next()
    this.passwrd= await bcrypt.hash(this.password,12)
  next()
})

userSchema.methods.correctPassword = async function(candidatePassword,userPassword){
  return await bcrypt.compare(candidatePassword,userPassword)
}
const User = mongoose.model('User', userSchema);
module.exports=User
