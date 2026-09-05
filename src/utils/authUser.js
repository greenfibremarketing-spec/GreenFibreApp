export function normalizeAuthUser(user) {
    if (!user) {
        return null;
    }

    const profileImage = user.profile_image;
    let avatar = null;
    if (typeof profileImage === 'string') {
        avatar = profileImage;
    }
    else if (profileImage?.thumbnail) {
        avatar = profileImage.thumbnail;
    }
    else if (profileImage?.original) {
        avatar = profileImage.original;
    }

    return {
        ...user,
        id: user.id || user._id,
        name: user.full_name || user.name || '',
        full_name: user.full_name || user.name || '',
        avatar,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        isVerified: user.isVerified ?? true,
    };
}

export function maskEmail(email) {
    if (!email) {
        return '';
    }

    const [localPart, domain] = email.split('@');
    if (!domain) {
        return email;
    }

    if (localPart.length <= 2) {
        return `${localPart[0] || '*'}***@${domain}`;
    }

    const visible = localPart.slice(0, 2);
    const hiddenLength = Math.max(localPart.length - 2, 3);
    return `${visible}${'*'.repeat(hiddenLength)}@${domain}`;
}
