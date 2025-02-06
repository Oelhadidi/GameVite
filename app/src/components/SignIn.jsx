import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import React, { useEffect } from 'react';

// Initialisation des variables d'environnement
const API_URL = import.meta.env.VITE_API_URL;

const SignIn = ({ darkMode }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state && location.state.message) {
      alert(location.state.message);
    }
  }, [location]);

  return (
    <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'text-white' : 'text-gray-500'}`}>
      {/* Return to Home Button */}
      <button
        onClick={() => navigate('/')}
        className={`absolute top-4 left-4 px-4 py-2 rounded-md text-sm font-medium ${
          darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        } transition-colors duration-300`}
      >
        Return to Home
      </button>

      <div className={`w-full max-w-md p-8 space-y-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg mx-4 md:mx-0`}>
        <h2 className={`text-3xl font-extrabold text-center ${darkMode ? 'text-white' : 'text-gray-500'}`}>Sign In</h2>
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={Yup.object({
            email: Yup.string().email('Invalid email address').required('Required'),
            password: Yup.string().required('Required'),
          })}
          onSubmit={async (values, { setSubmitting, setErrors }) => {
            try {
              const response = await axios.post(`${API_URL}/login`, {
                email: values.email,
                password: values.password,
              });

              localStorage.setItem('token', response.data.token);
              localStorage.setItem('user', JSON.stringify(response.data.user));

              setSubmitting(false);
              navigate('/');
            } catch (error) {
              setErrors({ email: 'Invalid email or password' });
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Email address
                </label>
                <Field
                  name="email"
                  type="email"
                  className={`mt-1 block w-full p-2 border ${
                    darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring focus:ring-indigo-500`}
                />
                <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Password
                </label>
                <Field
                  name="password"
                  type="password"
                  className={`mt-1 block w-full p-2 border ${
                    darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring focus:ring-indigo-500`}
                />
                <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white rounded-md py-2 hover:bg-indigo-500 transition-colors duration-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </button>

              <p className={`mt-4 text-center text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                Not a member?{' '}
                <Link
                  to="/signup"
                  className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors duration-300"
                >
                  Sign up
                </Link>
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default SignIn;
