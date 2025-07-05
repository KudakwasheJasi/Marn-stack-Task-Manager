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
        <div className='w-full md:w-1/3 p-4 md:p-1 flex flex-col justify-center items-center'>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='form-container w-full md:w-[400px] flex flex-col gap-y-8 bg-white px-10 pt-14 pb-14 rounded-lg shadow-md hover:shadow-lg transition-shadow'
          >
            <div className=''>
              <p className='text-blue-600 text-3xl font-bold text-center hover:text-blue-700 transition-colors'>
                Welcome Back
              </p>
              <p className='text-center text-base text-gray-700 mt-2'>
                Sign in to continue
              </p>
            </div>

            <div className='flex flex-col gap-y-5'>
              <Textbox
                type="email"
                name="email"
                placeholder="email@example.com"
                label="Email Address"
                className='w-full rounded-full focus:ring-2 focus:ring-blue-500'
                register={register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                error={errors.email?.message}
                disabled={isSubmitting}
              />

              <Textbox
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter password"
                label="Password"
                className='w-full rounded-full focus:ring-2 focus:ring-blue-500'
                register={register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                error={errors.password?.message}
                disabled={isSubmitting}
                icon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                  </button>
                }
              />
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
  );
};

export default Login;