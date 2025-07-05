/**
    * @description      : 
    * @author           : kudakwashe Ellijah
    * @group            : 
    * @created          : 05/07/2025 - 16:09:29
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 05/07/2025
    * - Author          : kudakwashe Ellijah
    * - Modification    : 
**/
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import Textbox from "../components/Textbox";
import Button from "../components/Button";
import { toast } from "sonner";
import { login } from "../services/api";
import { useDispatch } from "react-redux";
import { loginSuccess, setLoading } from "../redux/slices/authSlice";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      dispatch(setLoading(true));
      
      // Log the email and password being used for login
      console.log("Attempting to log in with:", {
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      // Call the login API
      const response = await login({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      // Log the response for debugging
      console.log("Login response:", response);

      if (response?.user && response?.token) {
        dispatch(loginSuccess({
          user: response.user,
          token: response.token
        }));
        
        toast.success("Login successful! Welcome back!");
        reset(); // Clear form
        navigate("/dashboard"); // Redirect to dashboard
      } else {
        toast.error("Invalid login response. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed. Please check your credentials and try again.");
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <div className='w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-[#f3f4f6]'>
      <div className='w-full md:w-auto flex gap-0 md:gap-40 flex-col md:flex-row items-center justify-center'>
        {/* Left side - Branding */}
        <div className='h-full w-full lg:w-2/3 flex flex-col items-center justify-center'>
          <div className='w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center gap-5 md:gap-y-10 2xl:-mt-20'>
            <span className='flex gap-1 py-1 px-3 border rounded-full text-sm md:text-base border-gray-300 text-gray-600 hover:border-blue-500 transition-colors'>
              Welcome back to our platform!
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
        
        {/* Right side - Login Form */}
        <div className='w-full lg:w-1/3 flex items-center justify-center'>
          <div className='w-full max-w-md'>
            <form onSubmit={handleSubmit(onSubmit)} className='bg-white rounded-3xl shadow-2xl p-8 space-y-6'>
              <div className='text-center mb-8'>
                <h2 className='text-3xl font-bold text-gray-900 mb-2'>Welcome Back</h2>
                <p className='text-gray-600'>Sign in to your account to continue</p>
              </div>

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
                disabled={isSubmitting}
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
                    placeholder="Enter your password"
                    className='w-full px-4 py-3 pr-12 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters"
                      }
                    })}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                label={isSubmitting ? "Signing in..." : "Sign In"}
                className='w-full h-12 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold transform hover:scale-[1.02] active:scale-[0.98]'
                disabled={isSubmitting}
              />

              {/* Links Section */}
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
                  >
                    Create Account
                  </Link>
                </p>
                <Link
                  to="/forgot-password"
                  className="text-sm text-gray-500 hover:text-gray-600 hover:underline block transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;