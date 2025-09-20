import {Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {UserModel, CreateUserData, LoginData} from '../models/User';

export class AuthController {
    private userModel: UserModel;
    private readonly jwtSecret: string;
    private readonly jwtRefreshSecret: string;
    private readonly jwtExpiresIn: string;
    private readonly jwtRefreshExpiresIn: string;
    constructor(userModel: UserModel, jwtSecret: string,  jwtRefreshSecret: string,  jwtExpiresIn: string,  jwtRefreshExpiresIn: string) {
        this.userModel = userModel;
        this.jwtSecret = jwtSecret;
        this.jwtRefreshSecret = jwtRefreshSecret;
        this.jwtExpiresIn = jwtExpiresIn;
        this.jwtRefreshExpiresIn = jwtRefreshExpiresIn;
    }


    private generateAccessToken(userId: number, email: string): string {
        return jwt.sign(
            {id: userId, email},
            this.jwtSecret,
            {expiresIn: this.jwtExpiresIn} as jwt.SignOptions
        );
    }

    private generateRefreshToken(userId: number, email: string): string {
        return jwt.sign(
            {id: userId, email},
            this.jwtRefreshSecret,
            {expiresIn: this.jwtRefreshExpiresIn} as jwt.SignOptions
        );
    }

    private setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge:  parseInt(this.jwtExpiresIn) || 15
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: parseInt(this.jwtExpiresIn) || 15,
        });
    }

    private clearAuthCookies(res: Response): void {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
    }

    async register(req: Request, res: Response): Promise<void> {
        try {
            const {email, password, name, phone_number}: CreateUserData = req.body;

            if (!email || !password || !name || !phone_number) {
                res.status(400).json({error: 'Email, password, name, and phone number are required'});
                return;
            }

            if (password.length < 6) {
                res.status(400).json({error: 'Password must be at least 6 characters long'});
                return;
            }

            if (phone_number.length < 10) {
                res.status(400).json({error: 'Phone number must be at least 10 digits long'});
                return;
            }

            const existingUser = await this.userModel.findByEmail(email);
            if (existingUser) {
                res.status(409).json({error: 'User with this email already exists'});
                return;
            }

            const userData: CreateUserData = {
                email,
                password,
                name,
                phone_number: phone_number
            };

           

            const user = await this.userModel.create(userData);

            const accessToken = this.generateAccessToken(user.id!, user.email);
            const refreshToken = this.generateRefreshToken(user.id!, user.email);

            await this.userModel.updateRefreshToken(user.id!, refreshToken);

            this.setAuthCookies(res, accessToken, refreshToken);

            res.status(201).json({
                message: 'User registered successfully',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    phone_number: user.phone_number,
                },
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({error: 'Internal server error'});
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const {email, password}: LoginData = req.body;

            if (!email || !password) {
                res.status(400).json({error: 'Email and password are required'});
                return;
            }

            const user = await this.userModel.findByEmail(email);
            if (!user) {
                res.status(401).json({error: 'Invalid email or password'});
                return;
            }

            const isValidPassword = await this.userModel.verifyPassword(password, user.password);
            if (!isValidPassword) {
                res.status(401).json({error: 'Invalid email or password'});
                return;
            }
            const accessToken = this.generateAccessToken(user.id!, user.email);
            const refreshToken = this.generateRefreshToken(user.id!, user.email);

            await this.userModel.updateRefreshToken(user.id!, refreshToken);

            // Set cookies
            this.setAuthCookies(res, accessToken, refreshToken);

            res.json({
                message: 'Login successful',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
                accessToken: accessToken,
                refreshToken: refreshToken
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({error: 'Internal server error'});
        }
    }

    async refresh(req: Request, res: Response): Promise<void> {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                res.status(401).json({error: 'Refresh token not found'});
                return;
            }

            // Verify refresh token
            const decoded = jwt.verify(refreshToken, this.jwtRefreshSecret) as { id: number; email: string };

            // Find user by refresh token
            const user = await this.userModel.findByRefreshToken(refreshToken);
            if (!user || user.id !== decoded.id) {
                res.status(401).json({error: 'Invalid refresh token'});
                return;
            }

            // Generate new tokens
            const newAccessToken = this.generateAccessToken(user.id!, user.email);
            const newRefreshToken = this.generateRefreshToken(user.id!, user.email);

            // Update refresh token in database
            await this.userModel.updateRefreshToken(user.id!, newRefreshToken);

            // Set new cookies
            this.setAuthCookies(res, newAccessToken, newRefreshToken);

            res.json({
                message: 'Token refreshed successfully',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
            });
        } catch (error) {
            console.error('Refresh token error:', error);
            this.clearAuthCookies(res);
            res.status(401).json({error: 'Invalid refresh token'});
        }
    }

    async logout(req: Request, res: Response): Promise<void> {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (refreshToken) {
                // Find user and clear refresh token from database
                const user = await this.userModel.findByRefreshToken(refreshToken);
                if (user) {
                    await this.userModel.updateRefreshToken(user.id!, null);
                }
            }

            // Clear cookies
            this.clearAuthCookies(res);

            res.json({message: 'Logged out successfully'});
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({error: 'Internal server error'});
        }
    }
}