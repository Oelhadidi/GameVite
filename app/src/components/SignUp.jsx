import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignUp = ({ darkMode }) => {
  const navigate = useNavigate();

  return (
    <div className={`flex items-center justify-center mt-7 ${darkMode ? ' text-white' : ' text-gray-500'}`}>
      <div className={`w-full max-w-md p-8 space-y-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg mx-4 md:mx-0`}>
        <h2 className={`text-3xl font-extrabold text-center ${darkMode ? 'text-white' : 'text-gray-500'}`}>Sign Up</h2>
        <Formik
          initialValues={{ 
            firstName: '', 
            lastName: '', 
            email: '', 
            username: '', 
            password: '', 
            verifyPassword: '' 
          }}
          validationSchema={Yup.object({
            firstName: Yup.string().required('First name is required'),
            lastName: Yup.string().required('Last name is required'),
            email: Yup.string().email('Invalid email address').required('Email is required'),
            username: Yup.string().required('Username is required'),
            password: Yup.string().min(6, 'Must be at least 6 characters').required('Password is required'),
            verifyPassword: Yup.string()
              .oneOf([Yup.ref('password'), null], 'Passwords must match')
              .required('Password confirmation is required'),
          })}
          onSubmit={async (values, { setSubmitting, setErrors }) => {
            try {
              const response = await axios.post('http://localhost:3000/register', {
                firstname: values.firstName,
                lastname: values.lastName,
                email: values.email,
                username: values.username,
                password: values.password
              });

              // Check the response for success or error
              if (response.data.error) {
                alert(`Error: ${response.data.error}`);
                setErrors({ email: response.data.error });
              } else if (response.data.success) {
                alert(`Success: ${response.data.message}`);
                setSubmitting(false);
                navigate('/'); // Redirect on success
              } else {
                alert('An unexpected response was received. Please try again.');
              }
            } catch (error) {
              alert(error.response.data);
              console.error('Error during Sign Up:', error.response.data);
              setErrors({ email: 'Email already used or other error' });
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label htmlFor="firstName" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>First Name</label>
                <Field 
                  name="firstName" 
                  type="text" 
                  className={`mt-1 block w-full p-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-md focus:outline-none focus:ring focus:ring-indigo-500`} 
                />
                <ErrorMessage name="firstName" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <div>
                <label htmlFor="lastName" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Last Name</label>
                <Field 
                  name="lastName" 
                  type="text" 
                  className={`mt-1 block w-full p-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-md focus:outline-none focus:ring focus:ring-indigo-500`} 
                />
                <ErrorMessage name="lastName" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <div>
                <label htmlFor="email" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email address</label>
                <Field 
                  name="email" 
                  type="email" 
                  className={`mt-1 block w-full p-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-md focus:outline-none focus:ring focus:ring-indigo-500`} 
                />
                <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <div>
                <label htmlFor="username" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Username</label>
                <Field 
                  name="username" 
                  type="text" 
                  className={`mt-1 block w-full p-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-md focus:outline-none focus:ring focus:ring-indigo-500`} 
                />
                <ErrorMessage name="username" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <div>
                <label htmlFor="password" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
                <Field 
                  name="password" 
                  type="password" 
                  className={`mt-1 block w-full p-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-md focus:outline-none focus:ring focus:ring-indigo-500`} 
                />
                <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <div>
                <label htmlFor="verifyPassword" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confirm Password</label>
                <Field 
                  name="verifyPassword" 
                  type="password" 
                  className={`mt-1 block w-full p-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-md focus:outline-none focus:ring focus:ring-indigo-500`} 
                />
                <ErrorMessage name="verifyPassword" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <button 
                type="submit" 
                className="w-full bg-indigo-600 text-white rounded-md py-2 hover:bg-indigo-500 transition-colors duration-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing Up...' : 'Sign Up'}
              </button>

              <p className={`mt-4 text-center text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                Already a member? <Link to="/signin" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors duration-300">Sign in</Link>
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default SignUp;
