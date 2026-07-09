export const createAuthService = (userRepo, jwtUtil, bcryptUtil) => {
    const signInService = async (params) => {
        const { email, password } = params;
        // 사용자 정보 조회
        const foundUser = await userRepo.findUserByEmail(email);
        if (!foundUser) {
            throw new Error("이메일 또는 비밀번호가 일치하지 않습니다");
        }
        // 저장된 비밀번호와 입력값을 비교한다
        const isPasswordValid = await bcryptUtil.compare(password, foundUser.password);
        if (!isPasswordValid) {
            throw new Error("이메일 또는 비밀번호가 일치하지 않습니다");
        }
        // JWT 토큰 생성 및 반환
        const token = jwtUtil.sign({ userId: foundUser.id }, 3600);
        return token;
    };
    const signUpService = async (params) => {
        const { email, password, username } = params;
        // 중복 이메일 확인
        const existingUser = await userRepo.findUserByEmail(email);
        if (existingUser) {
            throw new Error("이미 등록된 이메일입니다.");
        }
        // 새 사용자를 생성하기 전에 비밀번호를 해시한다
        const hashedPassword = await bcryptUtil.hash(password, 10);
        const newUser = await userRepo.createUser({
            email,
            password: hashedPassword,
            username,
        });
        // JWT 토큰 생성 및 반환
        const token = jwtUtil.sign({ userId: newUser.id }, 3600);
        return token;
    };
    return { signInService, signUpService };
};
