/**
    * @description      : 
    * @author           : kudakwashe Ellijah
    * @group            : 
    * @created          : 05/07/2025 - 16:10:13
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 05/07/2025
    * - Author          : kudakwashe Ellijah
    * - Modification    : 
**/
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import Textbox from "../components/Textbox";
import Button from "../components/Button";
import { toast } from "sonner";
import { register as registerUser } from "../services/api";
import { useDispatch } from "react-redux";
import { setLoading as setLoadingState } from "../redux/slices/authSlice";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      dispatch(setLoadingState(true));
      
      const userData = {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        password: data.password
      };

      // Validate form data
      if (!userData.name || !userData.email || !userData.password) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Check if passwords match
      if (data.password !== data.confirmPassword) {
        toast.error("Passwords don't match!");
        return;
      }

      // Attempt to register the user
      const response = await registerUser(userData);
      
      if (response?.status) {
        // Success animation and message
        toast.success(
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full animate-bounce"></div>
            </div>
            <span>Registration successful! Please login to continue.</span>
          </div>
        );
        reset();
        navigate('/log-in');
      } else {
        throw new Error(response?.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
      dispatch(setLoadingState(false));
    }
  };

  return (
    <div className='w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-[#f3f4f6]'>
      <div className='w-full md:w-auto flex gap-0 md:gap-40 flex-col md:flex-row items-center justify-center'>
        {/* Left side - Branding */}
        <div className='h-full w-full lg:w-2/3 flex flex-col items-center justify-center'>
          <div className='w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center gap-5 md:gap-y-10 2xl:-mt-20'>
            <span className='flex gap-1 py-1 px-3 border rounded-full text-sm md:text-base border-gray-300 text-gray-600 hover:border-blue-500 transition-colors'>
              Join our task management platform!
            </span>
            <p className='flex flex-col gap-0 md:gap-4 text-4xl md:text-6xl 2xl:text-7xl font-black text-center text-blue-700'>
              <span className="hover:text-blue-800 transition-colors">Jasi Empire</span>
              <span className="hover:text-blue-800 transition-colors">Task Manager</span>
            </p>
          </div>
          <div className='cell'>
              <div className='circle rotate-in-up-left'></div>
            </div>
        </div>

        {/* Right side - Form */}
        <div className='w-full lg:w-1/3 flex items-center justify-center'>
          <div className='w-full max-w-md'>
            <form onSubmit={handleSubmit(onSubmit)} className='bg-white rounded-3xl shadow-2xl p-8 space-y-6'>
              <div className='text-center mb-8'>
                <h2 className='text-3xl font-bold text-gray-900 mb-2'>Create Account</h2>
                <p className='text-gray-600'>Join us and start managing your tasks</p>
              </div>

              <Textbox
                type="text"
                name="name"
                placeholder="Enter your full name"
                label="Full Name"
                className='w-full rounded-full focus:ring-2 focus:ring-blue-500'
                register={register("name", {
                  required: "Full name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters"
                  }
                })}
                error={errors.name?.message}
                disabled={loading}
              />

              <Textbox
                type="email"
                name="email"
                placeholder="Enter your email"
                label="Email Address"
                className='w-full rounded-full focus:ring-2 focus:ring-blue-500'
                register={register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                error={errors.email?.message}
                disabled={loading}
              />

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Create a password"
                    className='w-full px-4 py-3 pr-12 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters"
                      }
                    })}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    className='w-full px-4 py-3 pr-12 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: value => value === password || "Passwords don't match"
                    })}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                label={loading ? 'Creating Account...' : 'Register'}
                className='w-full h-12 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold transform hover:scale-[1.02] active:scale-[0.98]'
                disabled={loading}
              />

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/log-in"
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
                >
                  Login here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;