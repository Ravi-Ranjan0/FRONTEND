import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import useAuth from "@/hooks/useAuth";

import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// username, email, password
const formSchema = z.object({
  username: z.string().trim().min(4, {
    message: "Please enter your username.",
  }),
  email: z.string().email(),
  password: z.string().min(8, {
    message: "Please enter your password.",
  }),
});

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

function LoginForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigator = useNavigate();

  const { status, user } = useSelector((state: RootState) => state.auth);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const formData = new FormData();
      formData.append("username", values.username);
      formData.append("email", values.email);
      formData.append("password", values.password);

      setLoading(true);
      console.log("Authenticating -> ", status);
      console.log("User -> ", user);
      const response = await axios.post(
        "http://localhost:8000/api/v1/users/login",
        formData,
        {
          headers: {
            "Content-Type": "application/json", // Set the content type to JSON
          },
        }
      );
      if (response.status !== 200) {
        throw new Error(response?.data?.message);
      }
      console.log(response);
      login(response.data.data.user);
      const accessToken = response.data.data.accessToken;
      const refreshToken = response.data.data.refreshToken;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      toast({
        title: "Login Successfully",
        description: response.data.message,
      });
      setLoading(false);
      navigator("/");
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="gary" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="gary121@gmail.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit">
          Login
        </Button>
      </form>
    </Form>
  );
}

export default LoginForm;