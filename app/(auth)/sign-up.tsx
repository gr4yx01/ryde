import { View, Text, ScrollView, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { icons, images } from '@/constants'
import InputField from '@/components/InputField'
import CustomButton from '@/components/CustomButton'
import OAuth from '@/components/OAuth'
import { Link, useRouter } from 'expo-router'
import { useSignUp } from '@clerk/clerk-expo'
import ReactNativeModal from 'react-native-modal'


const SignUp = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: ''
    })
    const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [code, setCode] = React.useState('')
  const [verification, setVerification] = useState({
    state: 'default',
    error: '',
    code: ''
  })


    const onSignUpPress = async () => {
        if (!isLoaded) {
          return
        }
    
        try {
          await signUp.create({
            emailAddress: form.email,
            password: form.password,
          })
    
          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
    
          setVerification({
            ...verification,
            state: 'pending'
          })
        } catch (err: any) {
          Alert.alert('Error', err.errors[0].longMessage);
        }
      }

      const onPressVerify = async () => {
        if (!isLoaded) {
          return
        }
    
        try {
          const completeSignUp = await signUp.attemptEmailAddressVerification({
            code: verification.code,
          })
    
          if (completeSignUp.status === 'complete') {
            // create a database user

            await setActive({ session: completeSignUp.createdSessionId })
            setVerification({
                ...verification,
                state: 'success'
            })
            router.push('/(root)/(tabs)/home')
          } else {
            setVerification({
                ...verification,
                state: 'failed',
                error: 'Verification failed'
            })
            console.error(JSON.stringify(completeSignUp, null, 2))
          }
        } catch (err: any) {
            setVerification({
                ...verification,
                state: 'failed',
                error: err.errors[0].longMessage,
            })
          console.error(JSON.stringify(err, null, 2))
        }
      }
    

  return (
    <ScrollView className='flex-1 bg-white'>
        <View className='flex-1 bg-white'>
            <View className='relative w-full h-[250px]'>
                <Image 
                    source={images.signUpCar}
                    className='z-0 w-full h-[250px]'
                />
                <Text className='text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5'>Create Your Account</Text>
            </View>
                <View className='p-5'>
                    <InputField
                        label="Name"
                        placeholder="Enter your name"
                        icon={icons.person}
                        value={form.name}
                        onChangeText={(value) => setForm({...form, name: value})}
                    />
                    <InputField
                        label="Email"
                        placeholder="Enter your email"
                        icon={icons.email}
                        value={form.email}
                        onChangeText={(value) => setForm({...form, email: value})}
                    />
                    <InputField
                        label="Password"
                        placeholder="Enter your password"
                        icon={icons.lock}
                        value={form.password}
                        secureTextEntry
                        onChangeText={(value) => setForm({...form, password: value})}
                    />

                    <CustomButton 
                        title="Sign Up"
                        onPress={onSignUpPress}
                        className='mt-6'
                    />

                    {/** OAuth */}
                    <OAuth />

                    <Link href="/sign-in" className='text-lg text-center text-general-200 mt-5'>
                        <Text>Already have an account? </Text>
                        <Text className='text-primary-500'>Log In</Text>
                    </Link>
                </View>

                <ReactNativeModal 
                onModalHide={() => {
                    if(verification.state === 'success') setShowSuccessModal(true);
                }}
                isVisible={verification.state === 'pending'}>
                    <View className='bg-white px-7 py-9 rounded-2xl min-h-[300px]'>
                        <Text className='text-2xl font-JakartaExtraBold mb-2'>
                            Verification
                        </Text>
                        <Text className='font-Jakarta text-center mb-5'>
                            We've sent a verification code to {form.email}
                        </Text>
                        <InputField 
                            label="Code"
                            icon={icons.lock}
                            placeholder='12345'
                            keyboardType='numeric'
                            value={verification.code}
                            onChangeText={(code) => setVerification({
                                ...verification,
                                code
                            })}
                        />

                        {verification.error && (
                            <Text className='text-red-500 text-sm mt-1'>
                                {verification.error}
                            </Text>
                        )}

                        <CustomButton 
                            title="Verify Email"
                            onPress={onPressVerify}
                            className='mt-5 bg-success-500'
                        />
                    </View>
                </ReactNativeModal>

                {/** Verification Modal */}
                <ReactNativeModal isVisible={showSuccessModal}>
                    <View className='bg-white px-7 py-9 rounded-2xl min-h-[300px]'>
                        <Image source={images.check} className='w-[110px] h-[110px] mx-auto my-5'/>
                        <Text className='text-3xl font-JakartaBold text-center'>
                            Verified
                        </Text>
                        <Text className='text-base text-gray-400 font-Jakarta text-center mt-2'>
                            You have successfully verified your account.
                        </Text>
                        <CustomButton 
                            title="Browse Home"
                            onPress={() =>  {
                                setShowSuccessModal(false);
                                router.replace('/(root)/(tabs)/home')
                            }}
                            className='mt-5'
                        />
                    </View>
                </ReactNativeModal>
        </View>
    </ScrollView>
  )
}

export default SignUp