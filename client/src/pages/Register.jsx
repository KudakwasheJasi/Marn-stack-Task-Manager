import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import Textbox from "../components/Textbox";
import Button from "../components/Button";
import { toast } from "sonner";
import { register as registerUser } from "../services/api";
import { useDispatch } from "react-redux";
import { setLoading as setLoadingState } from "../redux/slices/authSlice";

const Register = () => {
  const [loading, setLoading] = useState(false);
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

      // Check if passwords match
      if (data.password !== data.confirmPassword) {
        toast.error("Passwords don't match!");
        return;
      }

      // Attempt to register the user
      const response = await registerUser(userData);

      if (response) {
        toast.success('Registration successful! Please login to continue.');
        reset();
        navigate('/log-in');
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
        </div>

        {/* Right side - Form */}
        <div className='w-full md:w-1/3 p-4 md:p-1 flex flex-col justify-center items-center'>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='form-container w-full md:w-[400px] flex flex-col gap-y-8 bg-white px-10 pt-14 pb-14 rounded-lg shadow-md hover:shadow-lg transition-shadow'
          >
            <div className=''>
              <p className='text-blue-600 text-3xl font-bold text-center hover:text-blue-700 transition-colors'>
                Create Account
              </p>
              <p className='text-center text-base text-gray-700 mt-2'>
                Get started with task management
              </p>
            </div>

            <div className='flex flex-col gap-y-5'>
              <Textbox
                type="text"
                name="name"
                placeholder="Enter username"
                label="Username"
                className='w-full rounded-full focus:ring-2 focus:ring-blue-500'
                register={register("name", {
                  required: "Username is required",
                  minLength: {
                    value: 2,
                    message: "Username must be at least 2 characters"
                  },
                  pattern: {
                    value: /^[A-Za-z\s]*$/,
                    message: "Username can only contain letters and spaces"
                  }
                })}
                error={errors.name?.message}
                disabled={loading}
              />

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
                    message: "Invalid email address"
                  }
                })}
                error={errors.email?.message}
                disabled={loading}
              />

              <Textbox
                type="password"
                name="password"
                placeholder="Enter password"
                label="Password"
                className='w-full rounded-full focus:ring-2 focus:ring-blue-500'
                register={register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters"
                  },
                  pattern: {
                    value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/,
                    message: "Password must contain at least one letter and one number"
                  }
                })}
                error={errors.password?.message}
                disabled={loading}
              />

              <Textbox
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                label="Confirm Password"
                className='w-full rounded-full focus:ring-2 focus:ring-blue-500'
                register={register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: value => value === password || "Passwords don't match"
                })}
                error={errors.confirmPassword?.message}
                disabled={loading}
              />

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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;