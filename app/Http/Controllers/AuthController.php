<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AuthController
{
    // Show login page
    public function showLogin()
    {
        return Inertia::render('Login');
    }

    // Handle login POST
    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($data)) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Email atau password salah'], 422);
            }

            return back()->withErrors(['email' => 'Email atau password salah']);
        }

        $request->session()->regenerate();

        $user = Auth::user();
        
        // Check if there's a redirect parameter
        $redirectTo = $request->input('redirect');
        if (!$redirectTo) {
            $redirectTo = $user->role === 'admin' ? '/dashboard' : '/catalog';
        }

        if ($request->wantsJson()) {
            return response()->json(['ok' => true, 'redirect' => $redirectTo]);
        }

        return redirect($redirectTo);
    }

    // Show register page
    public function showRegister()
    {
        return Inertia::render('Register');
    }

    // Handle register POST
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => ['required','string','min:8', 'regex:/[A-Z]/', 'regex:/[0-9]/'],
            'password_confirmation' => 'required|same:password',
        ], [
            'password.regex' => 'Password harus mengandung minimal 1 huruf besar dan 1 angka.',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'customer', // Default role untuk user yang register
        ]);

        Auth::login($user);

        $redirectTo = $user->role === 'admin' ? '/dashboard' : '/catalog';

        if ($request->wantsJson()) {
            return response()->json(['ok' => true, 'redirect' => $redirectTo]);
        }

        return redirect()->intended($redirectTo);
    }

    // Logout
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
