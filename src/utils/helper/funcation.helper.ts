
export const responseSender = (message: string, status: number, success: boolean, data: any) => {
    return {
        message, status, data, success
    }
}