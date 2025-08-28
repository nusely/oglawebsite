const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[0-9\s\-\(\)]{10,}$/, 'Please enter a valid phone number']
  },
  // B2B Company Information
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  companyType: {
    type: String,
    required: [true, 'Company type is required'],
    enum: {
      values: [
        'Agriculture & Farming',
        'Food & Beverage', 
        'Cosmetics & Beauty',
        'Textiles & Fashion',
        'Healthcare & Pharmaceuticals',
        'Retail & Wholesale',
        'Manufacturing',
        'Export/Import',
        'Hospitality & Tourism',
        'Education',
        'Technology',
        'Construction',
        'Transportation & Logistics',
        'Energy & Utilities',
        'Other'
      ],
      message: 'Please select a valid company type'
    }
  },
  companyRole: {
    type: String,
    required: [true, 'Company role is required'],
    enum: {
      values: [
        'Owner/CEO',
        'Manager/Director',
        'Purchasing Manager',
        'Procurement Officer',
        'Sales Manager',
        'Marketing Manager',
        'Operations Manager',
        'Business Development',
        'Consultant',
        'Employee',
        'Other'
      ],
      message: 'Please select a valid company role'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  address: {
    street: {
      type: String,
      trim: true,
      maxlength: [100, 'Street address cannot exceed 100 characters']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [50, 'City cannot exceed 50 characters']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [50, 'State cannot exceed 50 characters']
    },
    country: {
      type: String,
      trim: true,
      maxlength: [50, 'Country cannot exceed 50 characters']
    },
    postalCode: {
      type: String,
      trim: true,
      maxlength: [20, 'Postal code cannot exceed 20 characters']
    }
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'super_admin'],
    default: 'customer'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLoginAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ companyName: 1 });
userSchema.index({ companyType: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for company info
userSchema.virtual('companyInfo').get(function() {
  return {
    name: this.companyName,
    type: this.companyType,
    role: this.companyRole
  };
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    phone: this.phone,
    companyName: this.companyName,
    companyType: this.companyType,
    companyRole: this.companyRole,
    address: this.address,
    role: this.role,
    isActive: this.isActive,
    createdAt: this.createdAt
  };
};

// Static method to find users by company type
userSchema.statics.findByCompanyType = function(companyType) {
  return this.find({ companyType, isActive: true });
};

// Static method to find users by company role
userSchema.statics.findByCompanyRole = function(companyRole) {
  return this.find({ companyRole, isActive: true });
};

module.exports = mongoose.model('User', userSchema);
