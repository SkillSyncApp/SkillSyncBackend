import { Request, Response } from 'express';
import User from '../models/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const register = async (req: Request, res: Response) => {
    const {name, email, password, type, bio} = req.body

    if (!name || !email || !password || !type || !bio ) 
        return res.status(400).send("can't register the user - missing info");
    
    try {
        const rs = await User.findOne({ 'email': email });
        if (rs != null) return res.status(406).send("User already exists");
        
        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(password, salt);

        const rs2 = await User.create({ 'name': name, 'email': email, 'password': encryptedPassword, 'type': type, 'bio': bio });
        return res.status(201).send(rs2);
    } catch (err) {
        return res.status(400).send(err.message);
    }
}

const login = async (req: Request, res: Response) => {
    const {email, password} = req.body;
    
    if (!email || !password) return res.status(400).send("missing email or password");
    
    try {
        const user = await User.findOne({ 'email': email });
        if (user == null) return res.status(401).send("email or password incorrect");
        
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).send("email or password incorrect");
        
        const accessToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
        const refreshToken = jwt.sign({ _id: user._id }, process.env.JWT_REFRESH_SECRET);

        if (user.refreshTokens == null) user.refreshTokens = [refreshToken];
        else user.refreshTokens.push(refreshToken);
        
        await user.save();

        return res.status(200).send({
            'accessToken': accessToken,
            'refreshToken': refreshToken
        });
    } catch (err) {
        return res.status(400).send(err.message);
    }
}

const logout = async (req: Request, res: Response) => {
    const authHeader = req.headers['authorization'];
    const refreshToken = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (refreshToken == null) return res.sendStatus(401);
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, user: { '_id': string }) => {
        if (err) return res.sendStatus(401);

        try {
            const userDb = await User.findOne({ '_id': user._id });
            if (!userDb.refreshTokens || !userDb.refreshTokens.includes(refreshToken)) {
                userDb.refreshTokens = [];
                
                await userDb.save();
                return res.sendStatus(401);
            } else {
                userDb.refreshTokens = userDb.refreshTokens.filter((t: string) => t !== refreshToken);
                await userDb.save();
                return res.sendStatus(200);
            }
        } catch (err) {
            res.sendStatus(401).send(err.message);
        }
    });
}

const refresh = async (req: Request, res: Response) => {
    const authHeader = req.headers['authorization'];
    const refreshToken = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (refreshToken == null) return res.sendStatus(401);
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, user: { '_id': string }) => {
        if (err) {
            console.log(err);
            return res.sendStatus(401);
        }
        try {
            const userDb = await User.findOne({ '_id': user._id });
            if (!userDb?.refreshTokens || !userDb.refreshTokens.includes(refreshToken)) {
                userDb.refreshTokens = [];
                await userDb.save();
                return res.sendStatus(401);
            }
            const accessToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
            const newRefreshToken = jwt.sign({ _id: user._id }, process.env.JWT_REFRESH_SECRET);

            userDb.refreshTokens = userDb.refreshTokens.filter((t: string) => t !== refreshToken);
            userDb.refreshTokens.push(newRefreshToken);

            await userDb.save();
            return res.status(200).send({
                'accessToken': accessToken,
                'refreshToken': refreshToken
            });
        } catch (err) {
            res.sendStatus(401).send(err.message);
        }
    });
}

export default {
    register,
    login,
    logout,
    refresh
}