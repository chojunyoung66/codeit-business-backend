import { BusinessException } from "../../shared/business.exception.js";
export const createAuthService = (userRepo, jwtUtil, bcryptUtil) => {
    const signInService = async (params) => {
        const { email, password } = params;
        // 사용자 조회
        const foundUser = await userRepo.findUserByEmail(email);
        if (foundUser == null) {
            throw new BusinessException("이메일 또는 비밀번호가 일치하지 않습니다");
        }
        // 비밀번호 검증
        const isPasswordValid = await bcryptUtil.compare(password, foundUser.password);
        if (!isPasswordValid) {
            throw new BusinessException("이메일 또는 비밀번호가 일치하지 않습니다");
        }
        // JWT 토큰 생성
        const token = jwtUtil.sign({ userId: foundUser.id }, 3600);
        return token;
    };
    const signUpService = async (params) => {
        const { email, password, username } = params;
        // 트래픽이 적은 경우에만 방어가 가능합니다.
        const foundUser = await userRepo.findUserByEmail(email);
        if (foundUser !== null) {
            throw new BusinessException("이미 등록된 이메일입니다.");
        }
        // 비밀번호 암호화
        const hashedPassword = await bcryptUtil.hash(password, 10);
        const newUser = await userRepo.createUser({
            email,
            password: hashedPassword,
            username,
        });
        // JWT 토큰 생성
        const token = jwtUtil.sign({ userId: newUser.id }, 3600);
        return token;
    };
    return { signInService, signUpService };
};
