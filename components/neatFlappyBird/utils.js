export function adjustValueToNewRange(value, minValue, maxValue, minTargetValue, maxTargetValue) {
    const valuePercentage = (value - minValue) / (maxValue - minValue)
    const zeroBasedMaxTargetValue = maxTargetValue - minTargetValue
    
    return zeroBasedMaxTargetValue * valuePercentage + minTargetValue
}

export class ObjectPool {
    objects = []

    addObject(object) {
        this.objects.push(object)
    }

    getFreeObject() {
        for(let i = 0; i < this.objects.length; i++) {
            if(this.objects[i].isFree()) {
                return this.objects[i]
            }
        }
    }
}